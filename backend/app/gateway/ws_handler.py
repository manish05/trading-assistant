from dataclasses import asdict
from datetime import UTC, datetime
from typing import Any
from uuid import uuid4

from fastapi import WebSocket
from pydantic import BaseModel, ConfigDict, Field, ValidationError
from pydantic.alias_generators import to_camel
from starlette.websockets import WebSocketDisconnect

from app.audit.store import AuditStore
from app.backtesting.simulator import BacktestCandle, BacktestSimulator, TradeSignal
from app.config.loader import AppConfig
from app.devices.registry import DeviceRegistry
from app.gateway.models import GatewayConnectParams
from app.memory.index import MemoryIndex
from app.plugins.registry import ResolvedPlugins
from app.protocol.frames import RequestFrame, parse_gateway_frame
from app.queues.agent_queue import AgentQueue, AgentRequest, QueueSettings
from app.risk.engine import AccountRiskSnapshot, RiskEngine, RiskPolicy, TradeIntent
from app.trades.service import TradeExecutionService

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


class MemorySearchParams(BaseModel):
    model_config = ConfigDict(extra="forbid")

    workspacePath: str = Field(min_length=1)
    query: str = Field(min_length=1)
    maxResults: int = Field(default=10, ge=1, le=50)


class BacktestSignalInput(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        alias_generator=to_camel,
        populate_by_name=True,
    )

    index: int = Field(ge=0)
    side: str = Field(pattern="^(buy|sell)$")
    stop_loss: float = Field(alias="stopLoss")
    take_profit: float = Field(alias="takeProfit")


class BacktestsRunParams(BaseModel):
    model_config = ConfigDict(extra="forbid")

    candles: list[BacktestCandle] = Field(min_length=2)
    signals: list[BacktestSignalInput] = Field(min_length=1)


class DevicePairParams(BaseModel):
    model_config = ConfigDict(extra="forbid")

    deviceId: str = Field(min_length=1)
    platform: str = Field(min_length=1)
    label: str = Field(min_length=1)
    pushToken: str = Field(min_length=1)


class DeviceNotifyParams(BaseModel):
    model_config = ConfigDict(extra="forbid")

    deviceId: str = Field(min_length=1)
    message: str = Field(min_length=1)


class TradesPlaceParams(BaseModel):
    model_config = ConfigDict(extra="forbid")

    intent: TradeIntent
    policy: RiskPolicy
    snapshot: AccountRiskSnapshot


class TradesModifyParams(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        alias_generator=to_camel,
        populate_by_name=True,
    )

    account_id: str = Field(alias="accountId", min_length=1)
    order_id: str = Field(alias="orderId", min_length=1)
    open_price: float = Field(alias="openPrice")
    stop_loss: float | None = Field(default=None, alias="stopLoss")
    take_profit: float | None = Field(default=None, alias="takeProfit")


class TradesCancelParams(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        alias_generator=to_camel,
        populate_by_name=True,
    )

    account_id: str = Field(alias="accountId", min_length=1)
    order_id: str = Field(alias="orderId", min_length=1)


class TradesClosePositionParams(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        alias_generator=to_camel,
        populate_by_name=True,
    )

    account_id: str = Field(alias="accountId", min_length=1)
    position_id: str = Field(alias="positionId", min_length=1)


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


def _event_frame(event_name: str, payload: dict[str, Any]) -> dict:
    return {
        "type": "event",
        "event": event_name,
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
    app_config: AppConfig,
    device_registry: DeviceRegistry,
    memory_index: MemoryIndex,
    resolved_plugins: ResolvedPlugins,
    trade_execution_service: TradeExecutionService,
) -> None:
    await websocket.accept()

    connected = False
    session_id: str | None = None
    risk_engine = RiskEngine()
    backtest_simulator = BacktestSimulator()

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

        if frame.method == "config.get":
            await websocket.send_json(
                _ok_response(
                    frame.id,
                    payload=app_config.model_dump(mode="json"),
                )
            )
            continue

        if frame.method == "plugins.status":
            await websocket.send_json(
                _ok_response(
                    frame.id,
                    payload={
                        "enabledPlugins": sorted(resolved_plugins.enabled_plugins),
                        "activeSlots": resolved_plugins.active_slots,
                        "diagnostics": resolved_plugins.diagnostics,
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
                _event_frame(
                    "event.risk.preview",
                    {
                        "requestId": frame.id,
                        "decision": decision_payload,
                    },
                )
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

        if frame.method == "memory.search":
            try:
                params = MemorySearchParams.model_validate(frame.params)
            except ValidationError:
                await websocket.send_json(
                    _error_response(
                        frame.id,
                        code="INVALID_PARAMS",
                        message="invalid memory.search params",
                    )
                )
                continue

            memory_index.index_workspace(params.workspacePath)
            results = memory_index.search(params.query, max_results=params.maxResults)
            results_payload = [asdict(result) for result in results]
            audit_store.append(
                actor="user",
                action="memory.search",
                trace_id=frame.id,
                data={
                    "workspacePath": params.workspacePath,
                    "query": params.query,
                    "resultCount": len(results_payload),
                },
            )
            await websocket.send_json(
                _ok_response(
                    frame.id,
                    payload={"results": results_payload},
                )
            )
            continue

        if frame.method == "backtests.run":
            try:
                params = BacktestsRunParams.model_validate(frame.params)
            except ValidationError:
                await websocket.send_json(
                    _error_response(
                        frame.id,
                        code="INVALID_PARAMS",
                        message="invalid backtests.run params",
                    )
                )
                continue

            signal_map = {signal.index: signal for signal in params.signals}

            def strategy(
                index: int,
                history: list[BacktestCandle],
                signal_lookup: dict[int, BacktestSignalInput] = signal_map,
            ) -> TradeSignal | None:
                signal = signal_lookup.get(index)
                if signal is None:
                    return None
                return TradeSignal(
                    side=signal.side,
                    entry=history[index].close,
                    stop_loss=signal.stop_loss,
                    take_profit=signal.take_profit,
                )

            report = backtest_simulator.run(candles=params.candles, strategy=strategy)
            payload = {
                "trades": [asdict(trade) for trade in report.trades],
                "metrics": asdict(report.metrics),
                "equityCurve": report.equity_curve,
            }
            audit_store.append(
                actor="user",
                action="backtests.run",
                trace_id=frame.id,
                data={
                    "candles": len(params.candles),
                    "signals": len(params.signals),
                    "trades": report.metrics.trades,
                },
            )
            await websocket.send_json(
                _event_frame(
                    "event.backtests.report",
                    {
                        "requestId": frame.id,
                        "metrics": payload["metrics"],
                    },
                )
            )
            await websocket.send_json(_ok_response(frame.id, payload=payload))
            continue

        if frame.method == "devices.pair":
            try:
                params = DevicePairParams.model_validate(frame.params)
            except ValidationError:
                await websocket.send_json(
                    _error_response(
                        frame.id,
                        code="INVALID_PARAMS",
                        message="invalid devices.pair params",
                    )
                )
                continue

            paired = device_registry.pair(
                device_id=params.deviceId,
                platform=params.platform,
                label=params.label,
                push_token=params.pushToken,
            )
            payload = {"device": device_registry.as_public_payload(paired)}
            audit_store.append(
                actor="user",
                action="devices.pair",
                trace_id=frame.id,
                data={"deviceId": params.deviceId, "platform": params.platform},
            )
            await websocket.send_json(_ok_response(frame.id, payload=payload))
            continue

        if frame.method == "devices.list":
            devices = [
                device_registry.as_public_payload(device) for device in device_registry.list()
            ]
            await websocket.send_json(_ok_response(frame.id, payload={"devices": devices}))
            continue

        if frame.method == "devices.notifyTest":
            try:
                params = DeviceNotifyParams.model_validate(frame.params)
            except ValidationError:
                await websocket.send_json(
                    _error_response(
                        frame.id,
                        code="INVALID_PARAMS",
                        message="invalid devices.notifyTest params",
                    )
                )
                continue

            notify_result = device_registry.notify_test(
                device_id=params.deviceId,
                message=params.message,
            )
            audit_store.append(
                actor="user",
                action="devices.notifyTest",
                trace_id=frame.id,
                data={"deviceId": params.deviceId, "status": notify_result["status"]},
            )
            await websocket.send_json(_ok_response(frame.id, payload=notify_result))
            continue

        if frame.method == "trades.place":
            try:
                params = TradesPlaceParams.model_validate(frame.params)
            except ValidationError:
                await websocket.send_json(
                    _error_response(
                        frame.id,
                        code="INVALID_PARAMS",
                        message="invalid trades.place params",
                    )
                )
                continue

            risk_decision = risk_engine.evaluate(
                intent=params.intent,
                policy=params.policy,
                snapshot=params.snapshot,
            )
            if not risk_decision.allowed:
                risk_payload = risk_decision.model_dump(mode="json")
                audit_store.append(
                    actor="user",
                    action="trades.place.blocked",
                    trace_id=frame.id,
                    data={"decision": risk_payload},
                )
                await websocket.send_json(
                    _event_frame(
                        "event.risk.alert",
                        {
                            "requestId": frame.id,
                            "decision": risk_payload,
                        },
                    )
                )
                await websocket.send_json(
                    _error_response(
                        frame.id,
                        code="RISK_BLOCKED",
                        message="trade blocked by risk policy",
                        details={"decision": risk_payload},
                    )
                )
                continue

            execution = trade_execution_service.place(intent=params.intent)
            execution_payload = trade_execution_service.as_payload(execution)
            audit_store.append(
                actor="user",
                action="trades.place.executed",
                trace_id=frame.id,
                data={
                    "intent": params.intent.model_dump(mode="json"),
                    "execution": execution_payload,
                },
            )
            await websocket.send_json(
                _event_frame(
                    "event.trade.executed",
                    {
                        "requestId": frame.id,
                        "execution": execution_payload,
                    },
                )
            )
            await websocket.send_json(
                _ok_response(
                    frame.id,
                    payload={
                        "execution": execution_payload,
                        "riskDecision": risk_decision.model_dump(mode="json"),
                    },
                )
            )
            continue

        if frame.method == "trades.modify":
            try:
                params = TradesModifyParams.model_validate(frame.params)
            except ValidationError:
                await websocket.send_json(
                    _error_response(
                        frame.id,
                        code="INVALID_PARAMS",
                        message="invalid trades.modify params",
                    )
                )
                continue

            execution = trade_execution_service.modify(
                account_id=params.account_id,
                order_id=params.order_id,
                open_price=params.open_price,
                stop_loss=params.stop_loss,
                take_profit=params.take_profit,
            )
            execution_payload = trade_execution_service.as_payload(execution)
            audit_store.append(
                actor="user",
                action="trades.modify",
                trace_id=frame.id,
                data={"execution": execution_payload},
            )
            await websocket.send_json(
                _event_frame(
                    "event.trade.modified",
                    {"requestId": frame.id, "execution": execution_payload},
                )
            )
            await websocket.send_json(
                _ok_response(frame.id, payload={"execution": execution_payload})
            )
            continue

        if frame.method == "trades.cancel":
            try:
                params = TradesCancelParams.model_validate(frame.params)
            except ValidationError:
                await websocket.send_json(
                    _error_response(
                        frame.id,
                        code="INVALID_PARAMS",
                        message="invalid trades.cancel params",
                    )
                )
                continue

            execution = trade_execution_service.cancel(
                account_id=params.account_id,
                order_id=params.order_id,
            )
            execution_payload = trade_execution_service.as_payload(execution)
            audit_store.append(
                actor="user",
                action="trades.cancel",
                trace_id=frame.id,
                data={"execution": execution_payload},
            )
            await websocket.send_json(
                _event_frame(
                    "event.trade.canceled",
                    {"requestId": frame.id, "execution": execution_payload},
                )
            )
            await websocket.send_json(
                _ok_response(frame.id, payload={"execution": execution_payload})
            )
            continue

        if frame.method == "trades.closePosition":
            try:
                params = TradesClosePositionParams.model_validate(frame.params)
            except ValidationError:
                await websocket.send_json(
                    _error_response(
                        frame.id,
                        code="INVALID_PARAMS",
                        message="invalid trades.closePosition params",
                    )
                )
                continue

            execution = trade_execution_service.close_position(
                account_id=params.account_id,
                position_id=params.position_id,
            )
            execution_payload = trade_execution_service.as_payload(execution)
            audit_store.append(
                actor="user",
                action="trades.closePosition",
                trace_id=frame.id,
                data={"execution": execution_payload},
            )
            await websocket.send_json(
                _event_frame(
                    "event.trade.closed",
                    {"requestId": frame.id, "execution": execution_payload},
                )
            )
            await websocket.send_json(
                _ok_response(frame.id, payload={"execution": execution_payload})
            )
            continue

        await websocket.send_json(
            _error_response(
                frame.id,
                code="NOT_FOUND",
                message=f"unknown method: {frame.method}",
            )
        )
