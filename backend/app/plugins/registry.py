from dataclasses import dataclass, field


@dataclass(slots=True)
class PluginRecord:
    plugin_id: str
    kind: str


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

    def register_plugin(self, plugin: PluginRecord) -> None:
        if plugin.plugin_id in self._plugins:
            raise ValueError(f"Plugin '{plugin.plugin_id}' already registered")
        self._plugins[plugin.plugin_id] = plugin

    def resolve(self) -> ResolvedPlugins:
        diagnostics: list[str] = []
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
