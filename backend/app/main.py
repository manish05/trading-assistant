from datetime import UTC, datetime

from fastapi import FastAPI, WebSocket

from app.gateway.ws_handler import handle_gateway_websocket


def create_app() -> FastAPI:
    app = FastAPI(title="OpenClaw Inspired Platform Backend")
    app.state.started_at = datetime.now(UTC)

    @app.get("/health")
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    @app.websocket("/ws")
    async def websocket_endpoint(websocket: WebSocket) -> None:
        await handle_gateway_websocket(websocket, started_at=app.state.started_at)

    return app


app = create_app()
