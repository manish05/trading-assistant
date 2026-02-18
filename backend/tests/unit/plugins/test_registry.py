import pytest

from app.plugins.registry import PluginConfig, PluginRecord, PluginRegistry


def test_registry_selects_memory_slot_winner_from_config() -> None:
    registry = PluginRegistry(
        config=PluginConfig(
            allow=["sqlite_fts", "hybrid_embeddings"],
            deny=[],
            slots={"memory": "hybrid_embeddings"},
        )
    )
    registry.register_plugin(PluginRecord(plugin_id="sqlite_fts", kind="memory"))
    registry.register_plugin(PluginRecord(plugin_id="hybrid_embeddings", kind="memory"))

    resolved = registry.resolve()

    assert resolved.active_slots["memory"] == "hybrid_embeddings"
    assert resolved.enabled_plugins == {"sqlite_fts", "hybrid_embeddings"}


def test_registry_deny_overrides_allow() -> None:
    registry = PluginRegistry(
        config=PluginConfig(
            allow=["metaapi_mcp"],
            deny=["metaapi_mcp"],
            slots={},
        )
    )
    registry.register_plugin(PluginRecord(plugin_id="metaapi_mcp", kind="connector"))

    resolved = registry.resolve()

    assert resolved.enabled_plugins == set()


def test_registry_rejects_duplicate_plugin_ids() -> None:
    registry = PluginRegistry(
        config=PluginConfig(
            allow=[],
            deny=[],
            slots={},
        )
    )
    registry.register_plugin(PluginRecord(plugin_id="metaapi_mcp", kind="connector"))

    with pytest.raises(ValueError, match="already registered"):
        registry.register_plugin(PluginRecord(plugin_id="metaapi_mcp", kind="connector"))


def test_registry_discovers_plugin_manifests_from_roots(tmp_path) -> None:
    plugin_root = tmp_path / "plugins"
    memory_plugin_dir = plugin_root / "sqlite_fts"
    connector_plugin_dir = plugin_root / "metaapi_mcp"
    memory_plugin_dir.mkdir(parents=True)
    connector_plugin_dir.mkdir(parents=True)
    (memory_plugin_dir / "plugin.json").write_text(
        """
        {
          "id": "sqlite_fts",
          "name": "SQLite",
          "version": "0.1.0",
          "kinds": ["memory.backend"],
          "entry": {"type": "builtin.python"}
        }
        """,
        encoding="utf-8",
    )
    (connector_plugin_dir / "plugin.json").write_text(
        """
        {
          "id": "metaapi_mcp",
          "name": "MetaAPI",
          "version": "0.1.0",
          "kinds": ["connector.broker"],
          "entry": {"type": "external.mcp", "url": "http://localhost:3000/sse"}
        }
        """,
        encoding="utf-8",
    )
    registry = PluginRegistry(
        config=PluginConfig(
            allow=[],
            deny=[],
            slots={"memory": "sqlite_fts"},
        )
    )

    diagnostics = registry.discover_from_roots([plugin_root])
    resolved = registry.resolve()

    assert diagnostics == []
    assert resolved.enabled_plugins == {"sqlite_fts", "metaapi_mcp"}
    assert resolved.active_slots["memory"] == "sqlite_fts"


def test_registry_discovery_reports_invalid_and_duplicate_manifests(tmp_path) -> None:
    first_root = tmp_path / "plugins_a"
    second_root = tmp_path / "plugins_b"
    (first_root / "dup").mkdir(parents=True)
    (second_root / "dup").mkdir(parents=True)
    (first_root / "invalid").mkdir(parents=True)

    (first_root / "dup" / "plugin.json").write_text(
        """
        {
          "id": "dup_plugin",
          "name": "Dup A",
          "version": "0.1.0",
          "kinds": ["feed.external"],
          "entry": {"type": "external.http"}
        }
        """,
        encoding="utf-8",
    )
    (second_root / "dup" / "plugin.json").write_text(
        """
        {
          "id": "dup_plugin",
          "name": "Dup B",
          "version": "0.1.1",
          "kinds": ["feed.external"],
          "entry": {"type": "external.http"}
        }
        """,
        encoding="utf-8",
    )
    (first_root / "invalid" / "plugin.json").write_text("{bad json", encoding="utf-8")

    registry = PluginRegistry(config=PluginConfig())

    diagnostics = registry.discover_from_roots([first_root, second_root])
    resolved = registry.resolve()

    assert any("Failed parsing plugin manifest" in line for line in diagnostics)
    assert any("Duplicate plugin id 'dup_plugin'" in line for line in diagnostics)
    assert "dup_plugin" in resolved.enabled_plugins
