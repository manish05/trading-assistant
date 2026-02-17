from datetime import UTC, datetime
from typing import Any
from uuid import uuid4

from fastapi import WebSocket
from pydantic import ValidationError
from starlette.websockets import WebSocketDisconnect

from app.gateway.models import GatewayConnectParams
from app.protocol.frames import RequestFrame, parse_gateway_frame

PROTOCOL_VERSION = 1
SERVER_NAME = "mt5-claude-trader-v2"


def _error_response(
    request_id: str,
    *,
    code: str,
    message: str,
    details: Any | None = None,
) -> dict:
    payload: dict[str, Any] = {
        "type": "res",
        "id": request_id,
        "ok": False,
        "error": {
            "code": code,
            "message": message,
        },
    }
    if details is not None:
        payload["error"]["details"] = details
    return payload


def _ok_response(request_id: str, payload: dict[str, Any]) -> dict:
    return {
        "type": "res",
        "id": request_id,
        "ok": True,
        "payload": payload,
    }


async def handle_gateway_websocket(websocket: WebSocket, *, started_at: datetime) -> None:
    await websocket.accept()

    connected = False
    session_id: str | None = None

    while True:
        try:
            message = await websocket.receive_json()
        except WebSocketDisconnect:
            break

        request_id = str(message.get("id", "invalid")) if isinstance(message, dict) else "invalid"

        try:
            frame = parse_gateway_frame(message)
        except ValidationError:
            await websocket.send_json(
                _error_response(
                    request_id,
                    code="INVALID_REQUEST",
                    message="invalid request frame",
                )
            )
            continue

        if not isinstance(frame, RequestFrame):
            await websocket.send_json(
                _error_response(
                    request_id,
                    code="INVALID_REQUEST",
                    message="gateway accepts request frames only",
                )
            )
            continue

        if not connected:
            if frame.method != "gateway.connect":
                await websocket.send_json(
                    _error_response(
                        frame.id,
                        code="INVALID_REQUEST",
                        message="first request must be gateway.connect",
                    )
                )
                continue

            try:
                params = GatewayConnectParams.model_validate(frame.params)
            except ValidationError:
                await websocket.send_json(
                    _error_response(
                        frame.id,
                        code="INVALID_PARAMS",
                        message="invalid gateway.connect params",
                    )
                )
                continue

            if params.protocol.min > PROTOCOL_VERSION or params.protocol.max < PROTOCOL_VERSION:
                await websocket.send_json(
                    _error_response(
                        frame.id,
                        code="INVALID_REQUEST",
                        message="protocol mismatch",
                        details={"expectedProtocol": PROTOCOL_VERSION},
                    )
                )
                continue

            connected = True
            session_id = f"sess_{uuid4().hex[:12]}"
            await websocket.send_json(
                _ok_response(
                    frame.id,
                    payload={
                        "protocol": {"selected": PROTOCOL_VERSION},
                        "session": {"sessionId": session_id, "role": "operator"},
                        "server": {"name": SERVER_NAME, "version": "0.1.0"},
                    },
                )
            )
            continue

        if frame.method == "gateway.ping":
            await websocket.send_json(
                _ok_response(
                    frame.id,
                    payload={"now": datetime.now(UTC).isoformat()},
                )
            )
            continue

        if frame.method == "gateway.status":
            uptime_seconds = int((datetime.now(UTC) - started_at).total_seconds())
            await websocket.send_json(
                _ok_response(
                    frame.id,
                    payload={
                        "protocolVersion": PROTOCOL_VERSION,
                        "uptimeSeconds": max(uptime_seconds, 0),
                        "sessionId": session_id,
                        "server": {
                            "name": SERVER_NAME,
                            "version": "0.1.0",
                        },
                    },
                )
            )
            continue

        await websocket.send_json(
            _error_response(
                frame.id,
                code="NOT_FOUND",
                message=f"unknown method: {frame.method}",
            )
        )
