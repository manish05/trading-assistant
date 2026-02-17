from datetime import UTC, datetime
from pathlib import Path

from fastapi import FastAPI, WebSocket

from app.audit.store import AuditStore
from app.devices.registry import DeviceRegistry
from app.gateway.ws_handler import handle_gateway_websocket
from app.memory.index import MemoryIndex
from app.queues.agent_queue import AgentQueue
from app.trades.service import TradeExecutionService


def create_app(*, data_dir: str | Path = "data") -> FastAPI:
    app = FastAPI(title="OpenClaw Inspired Platform Backend")
    app.state.started_at = datetime.now(UTC)
    app.state.agent_queues: dict[str, AgentQueue] = {}
    app.state.audit_store = AuditStore(data_dir=data_dir)
    app.state.device_registry = DeviceRegistry()
    app.state.memory_index = MemoryIndex(db_path=Path(data_dir) / "memory.db")
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
            device_registry=app.state.device_registry,
            memory_index=app.state.memory_index,
            trade_execution_service=app.state.trade_execution_service,
        )

    return app


app = create_app()
