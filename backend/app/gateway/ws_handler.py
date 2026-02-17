from datetime import UTC, datetime
from typing import Any
from uuid import uuid4

from fastapi import WebSocket
from pydantic import BaseModel, ConfigDict, Field, ValidationError
from starlette.websockets import WebSocketDisconnect

from app.audit.store import AuditStore
from app.gateway.models import GatewayConnectParams
from app.protocol.frames import RequestFrame, parse_gateway_frame
from app.queues.agent_queue import AgentQueue, AgentRequest, QueueSettings
from app.risk.engine import AccountRiskSnapshot, RiskEngine, RiskPolicy, TradeIntent

PROTOCOL_VERSION = 1
SERVER_NAME = "mt5-claude-trader-v2"


class AgentRunRequestInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    request_id: str = Field(min_length=1)
    kind: str = Field(min_length=1)
    priority: str = Field(default="normal", min_length=1)
    dedupe_key: str | None = None
    payload: dict = Field(default_factory=dict)


class AgentRunParams(BaseModel):
    model_config = ConfigDict(extra="forbid")

    agentId: str = Field(min_length=1)
    request: AgentRunRequestInput


class AgentQueueStatusParams(BaseModel):
    model_config = ConfigDict(extra="forbid")

    agentId: str = Field(min_length=1)


class RiskPreviewParams(BaseModel):
    model_config = ConfigDict(extra="forbid")

    intent: TradeIntent
    policy: RiskPolicy
    snapshot: AccountRiskSnapshot


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


def _get_or_create_queue(agent_id: str, queues: dict[str, AgentQueue]) -> AgentQueue:
    if agent_id in queues:
        return queues[agent_id]
    queue = AgentQueue(QueueSettings(mode="followup", cap=50, drop_policy="old"))
    queues[agent_id] = queue
    return queue


async def handle_gateway_websocket(
    websocket: WebSocket,
    *,
    started_at: datetime,
    agent_queues: dict[str, AgentQueue],
    audit_store: AuditStore,
) -> None:
    await websocket.accept()

    connected = False
    session_id: str | None = None
    risk_engine = RiskEngine()

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

        if frame.method == "risk.preview":
            try:
                params = RiskPreviewParams.model_validate(frame.params)
            except ValidationError:
                await websocket.send_json(
                    _error_response(
                        frame.id,
                        code="INVALID_PARAMS",
                        message="invalid risk.preview params",
                    )
                )
                continue

            decision = risk_engine.evaluate(
                intent=params.intent,
                policy=params.policy,
                snapshot=params.snapshot,
            )
            decision_payload = decision.model_dump(mode="json")
            audit_store.append(
                actor="user",
                action="risk.preview",
                trace_id=frame.id,
                data={
                    "intent": params.intent.model_dump(mode="json"),
                    "decision": decision_payload,
                },
            )
            await websocket.send_json(
                _ok_response(
                    frame.id,
                    payload=decision_payload,
                )
            )
            continue

        if frame.method == "agent.run":
            try:
                params = AgentRunParams.model_validate(frame.params)
            except ValidationError:
                await websocket.send_json(
                    _error_response(
                        frame.id,
                        code="INVALID_PARAMS",
                        message="invalid agent.run params",
                    )
                )
                continue

            queue = _get_or_create_queue(params.agentId, agent_queues)
            request = AgentRequest(
                request_id=params.request.request_id,
                agent_id=params.agentId,
                kind=params.request.kind,
                priority=params.request.priority,
                dedupe_key=params.request.dedupe_key,
                payload=params.request.payload,
            )
            decision = queue.enqueue(request, now_ms=int(datetime.now(UTC).timestamp() * 1000))
            decision_payload = decision.model_dump(mode="json")
            audit_store.append(
                actor="user",
                action="agent.run",
                trace_id=frame.id,
                data={
                    "agentId": params.agentId,
                    "request": request.model_dump(mode="json"),
                    "decision": decision_payload,
                },
            )
            await websocket.send_json(
                _ok_response(
                    frame.id,
                    payload={
                        "decision": decision_payload,
                        "activeRequestId": (
                            queue.active_request.request_id if queue.active_request else None
                        ),
                        "pendingCount": len(queue.pending),
                    },
                )
            )
            continue

        if frame.method == "agent.queue.status":
            try:
                params = AgentQueueStatusParams.model_validate(frame.params)
            except ValidationError:
                await websocket.send_json(
                    _error_response(
                        frame.id,
                        code="INVALID_PARAMS",
                        message="invalid agent.queue.status params",
                    )
                )
                continue

            queue = _get_or_create_queue(params.agentId, agent_queues)
            await websocket.send_json(
                _ok_response(
                    frame.id,
                    payload={
                        "agentId": params.agentId,
                        "mode": queue.settings.mode,
                        "activeRequestId": (
                            queue.active_request.request_id if queue.active_request else None
                        ),
                        "pendingCount": len(queue.pending),
                        "collectBufferCount": len(queue.collect_buffer),
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
