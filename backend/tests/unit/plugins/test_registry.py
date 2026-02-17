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
