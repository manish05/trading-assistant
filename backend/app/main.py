from datetime import UTC, datetime
from pathlib import Path

from fastapi import FastAPI, WebSocket

from app.audit.store import AuditStore
from app.gateway.ws_handler import handle_gateway_websocket
from app.queues.agent_queue import AgentQueue


def create_app(*, data_dir: str | Path = "data") -> FastAPI:
    app = FastAPI(title="OpenClaw Inspired Platform Backend")
    app.state.started_at = datetime.now(UTC)
    app.state.agent_queues: dict[str, AgentQueue] = {}
    app.state.audit_store = AuditStore(data_dir=data_dir)

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
        )

    return app


app = create_app()
