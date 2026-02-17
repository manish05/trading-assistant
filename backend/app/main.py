from datetime import UTC, datetime
from pathlib import Path

from fastapi import FastAPI, WebSocket

from app.accounts.registry import AccountRegistry
from app.audit.store import AuditStore
from app.config.loader import AppConfig, default_config, load_config
from app.devices.registry import DeviceRegistry
from app.feeds.service import FeedService
from app.gateway.ws_handler import handle_gateway_websocket
from app.memory.index import MemoryIndex
from app.plugins.registry import PluginConfig, PluginRecord, PluginRegistry
from app.queues.agent_queue import AgentQueue
from app.queues.snapshot_store import QueueSnapshotStore
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
    backend_root = Path(__file__).resolve().parents[1]
    workspace_root = backend_root.parent
    plugin_registry.discover_from_roots(
        [
            backend_root / "plugins",
            workspace_root / "plugins",
        ]
    )
    if not plugin_registry.has_plugin("sqlite_fts"):
        plugin_registry.register_plugin(PluginRecord(plugin_id="sqlite_fts", kind="memory"))
    if not plugin_registry.has_plugin("metaapi_mcp"):
        plugin_registry.register_plugin(PluginRecord(plugin_id="metaapi_mcp", kind="connector"))
    resolved_plugins = plugin_registry.resolve()

    app = FastAPI(title="OpenClaw Inspired Platform Backend")
    state_dir = Path(data_dir) / "state"
    state_dir.mkdir(parents=True, exist_ok=True)
    queue_snapshot_store = QueueSnapshotStore(state_path=state_dir / "agent_queues.json")

    app.state.started_at = datetime.now(UTC)
    app.state.app_config = config
    app.state.agent_queues: dict[str, AgentQueue] = queue_snapshot_store.load()
    app.state.queue_snapshot_store = queue_snapshot_store
    app.state.audit_store = AuditStore(data_dir=data_dir)
    app.state.account_registry = AccountRegistry(state_path=state_dir / "accounts.json")
    for configured_account in config.accounts:
        app.state.account_registry.connect(
            account_id=configured_account.account_id,
            connector_id=configured_account.connector_id,
            provider_account_id=configured_account.provider_account_id,
            mode=configured_account.mode,
            label=configured_account.label,
            allowed_symbols=configured_account.allowed_symbols,
        )
    app.state.device_registry = DeviceRegistry(state_path=state_dir / "devices.json")
    app.state.feed_service = FeedService()
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
            queue_snapshot_store=app.state.queue_snapshot_store,
            audit_store=app.state.audit_store,
            account_registry=app.state.account_registry,
            app_config=app.state.app_config,
            device_registry=app.state.device_registry,
            feed_service=app.state.feed_service,
            memory_index=app.state.memory_index,
            resolved_plugins=app.state.resolved_plugins,
            trade_execution_service=app.state.trade_execution_service,
        )

    return app


app = create_app()
