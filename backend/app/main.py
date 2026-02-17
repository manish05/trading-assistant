from datetime import UTC, datetime
from pathlib import Path

from fastapi import FastAPI, WebSocket

from app.audit.store import AuditStore
from app.config.loader import AppConfig, default_config, load_config
from app.devices.registry import DeviceRegistry
from app.gateway.ws_handler import handle_gateway_websocket
from app.memory.index import MemoryIndex
from app.plugins.registry import PluginConfig, PluginRecord, PluginRegistry
from app.queues.agent_queue import AgentQueue
from app.trades.service import TradeExecutionService


def create_app(
    *,
    data_dir: str | Path = "data",
    config_path: str | Path | None = None,
) -> FastAPI:
    config: AppConfig
    if config_path:
        config = load_config(config_path)
    else:
        config = default_config()

    plugin_registry = PluginRegistry(
        config=PluginConfig(
            allow=config.plugins.allow,
            deny=config.plugins.deny,
            slots=config.plugins.slots,
        )
    )
    plugin_registry.register_plugin(PluginRecord(plugin_id="sqlite_fts", kind="memory"))
    plugin_registry.register_plugin(PluginRecord(plugin_id="metaapi_mcp", kind="connector"))
    resolved_plugins = plugin_registry.resolve()

    app = FastAPI(title="OpenClaw Inspired Platform Backend")
    app.state.started_at = datetime.now(UTC)
    app.state.app_config = config
    app.state.agent_queues: dict[str, AgentQueue] = {}
    app.state.audit_store = AuditStore(data_dir=data_dir)
    app.state.device_registry = DeviceRegistry()
    app.state.memory_index = MemoryIndex(db_path=Path(data_dir) / "memory.db")
    app.state.resolved_plugins = resolved_plugins
    app.state.trade_execution_service = TradeExecutionService()

    @app.get("/health")
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    @app.websocket("/ws")
    async def websocket_endpoint(websocket: WebSocket) -> None:
        await handle_gateway_websocket(
            websocket,
            started_at=app.state.started_at,
            agent_queues=app.state.agent_queues,
            audit_store=app.state.audit_store,
            app_config=app.state.app_config,
            device_registry=app.state.device_registry,
            memory_index=app.state.memory_index,
            resolved_plugins=app.state.resolved_plugins,
            trade_execution_service=app.state.trade_execution_service,
        )

    return app


app = create_app()
