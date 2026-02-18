from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path

from pydantic import BaseModel, ConfigDict, Field, ValidationError


class PluginManifestEntry(BaseModel):
    model_config = ConfigDict(extra="allow")

    type: str = Field(min_length=1)
    url: str | None = None


class PluginManifest(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: str = Field(min_length=1)
    name: str = Field(min_length=1)
    version: str = Field(min_length=1)
    kinds: list[str] = Field(min_length=1)
    entry: PluginManifestEntry


@dataclass(slots=True)
class PluginRecord:
    plugin_id: str
    kind: str
    source: str = "manual"
    manifest_path: str | None = None
    version: str | None = None
    entry_type: str | None = None


@dataclass(slots=True)
class PluginConfig:
    allow: list[str] = field(default_factory=list)
    deny: list[str] = field(default_factory=list)
    slots: dict[str, str] = field(default_factory=dict)


@dataclass(slots=True)
class ResolvedPlugins:
    enabled_plugins: set[str]
    active_slots: dict[str, str]
    diagnostics: list[str]


class PluginRegistry:
    def __init__(self, *, config: PluginConfig):
        self._config = config
        self._plugins: dict[str, PluginRecord] = {}
        self._discovery_diagnostics: list[str] = []

    def register_plugin(self, plugin: PluginRecord) -> None:
        if plugin.plugin_id in self._plugins:
            raise ValueError(f"Plugin '{plugin.plugin_id}' already registered")
        self._plugins[plugin.plugin_id] = plugin

    def has_plugin(self, plugin_id: str) -> bool:
        return plugin_id in self._plugins

    def discover_from_roots(self, roots: list[str | Path]) -> list[str]:
        diagnostics: list[str] = []
        for root in roots:
            root_path = Path(root)
            if not root_path.exists() or not root_path.is_dir():
                continue

            for manifest_path in self._iter_manifest_paths(root_path):
                try:
                    manifest = self._load_manifest(manifest_path)
                except ValueError as exc:
                    diagnostics.append(str(exc))
                    continue

                if manifest.id in self._plugins:
                    diagnostics.append(
                        "Duplicate plugin id "
                        f"'{manifest.id}' from '{manifest_path}' ignored"
                    )
                    continue

                self._plugins[manifest.id] = PluginRecord(
                    plugin_id=manifest.id,
                    kind=_normalize_kind(manifest.kinds),
                    source=str(root_path),
                    manifest_path=str(manifest_path),
                    version=manifest.version,
                    entry_type=manifest.entry.type,
                )

        self._discovery_diagnostics.extend(diagnostics)
        return diagnostics

    def resolve(self) -> ResolvedPlugins:
        diagnostics: list[str] = list(self._discovery_diagnostics)
        allow = set(self._config.allow)
        deny = set(self._config.deny)
        all_plugins = set(self._plugins.keys())

        enabled = set(all_plugins) if not allow else all_plugins.intersection(allow)
        enabled = enabled.difference(deny)

        active_slots: dict[str, str] = {}
        slot_kind_map = {"memory": "memory"}

        for slot_name, slot_plugin_id in self._config.slots.items():
            plugin = self._plugins.get(slot_plugin_id)
            expected_kind = slot_kind_map.get(slot_name)

            if plugin is None:
                diagnostics.append(
                    f"Slot '{slot_name}' references unknown plugin '{slot_plugin_id}'"
                )
                continue

            if slot_plugin_id not in enabled:
                diagnostics.append(f"Slot '{slot_name}' plugin '{slot_plugin_id}' is not enabled")
                continue

            if expected_kind and plugin.kind != expected_kind:
                diagnostics.append(
                    f"Slot '{slot_name}' expects kind '{expected_kind}' but got '{plugin.kind}'"
                )
                continue

            active_slots[slot_name] = slot_plugin_id

        return ResolvedPlugins(
            enabled_plugins=enabled,
            active_slots=active_slots,
            diagnostics=diagnostics,
        )

    @staticmethod
    def _iter_manifest_paths(root_path: Path) -> list[Path]:
        manifests: list[Path] = []

        direct_manifest = root_path / "plugin.json"
        if direct_manifest.exists():
            manifests.append(direct_manifest)

        for child in sorted(root_path.iterdir(), key=lambda item: item.name):
            if not child.is_dir():
                continue
            manifest = child / "plugin.json"
            if manifest.exists():
                manifests.append(manifest)

        return manifests

    @staticmethod
    def _load_manifest(path: Path) -> PluginManifest:
        try:
            raw = json.loads(path.read_text(encoding="utf-8"))
        except OSError as exc:
            raise ValueError(f"Failed reading plugin manifest '{path}': {exc}") from exc
        except json.JSONDecodeError as exc:
            raise ValueError(f"Failed parsing plugin manifest '{path}': {exc}") from exc

        try:
            return PluginManifest.model_validate(raw)
        except ValidationError as exc:
            raise ValueError(f"Invalid plugin manifest '{path}': {exc}") from exc


def _normalize_kind(kinds: list[str]) -> str:
    normalized = [kind.strip() for kind in kinds if kind.strip()]
    normalized_set = set(normalized)

    if "memory.backend" in normalized_set or "memory" in normalized_set:
        return "memory"
    if any(kind.startswith("connector.") for kind in normalized_set):
        return "connector"
    if any(kind.startswith("feed.") for kind in normalized_set):
        return "feed"
    if any(kind.startswith("channel.") for kind in normalized_set):
        return "channel"

    return normalized[0] if normalized else "unknown"
