from dataclasses import asdict
from datetime import UTC, datetime
from typing import Any, Literal
from uuid import uuid4

from fastapi import WebSocket
from pydantic import BaseModel, ConfigDict, Field, ValidationError
from pydantic.alias_generators import to_camel
from starlette.websockets import WebSocketDisconnect

from app.accounts.registry import AccountRegistry
from app.agents.registry import AgentRegistry
from app.audit.store import AuditStore
from app.backtesting.simulator import BacktestCandle, BacktestSimulator, TradeSignal
from app.config.loader import AppConfig
from app.devices.registry import DeviceRegistry
from app.feeds.service import FeedService
from app.gateway.models import GatewayConnectParams
from app.marketplace.copytrade import CopyTradeMapper, CopyTradeSignal, FollowerConstraints
from app.memory.index import MemoryIndex
from app.plugins.registry import ResolvedPlugins
from app.protocol.frames import RequestFrame, parse_gateway_frame
from app.queues.agent_queue import AgentQueue, AgentRequest, QueueSettings
from app.queues.snapshot_store import QueueSnapshotStore
from app.risk.control import RiskControlState
from app.risk.engine import (
    AccountRiskSnapshot,
    RiskDecision,
    RiskEngine,
    RiskPolicy,
    RiskViolation,
    TradeIntent,
    ViolationCode,
)
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


class RiskEmergencyStopParams(BaseModel):
    model_config = ConfigDict(extra="forbid")

    action: Literal["pause_trading", "cancel_all", "close_all", "disable_live"]
    reason: str | None = None


class RiskResumeParams(BaseModel):
    model_config = ConfigDict(extra="forbid")

    reason: str | None = None


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


class DeviceUnpairParams(BaseModel):
    model_config = ConfigDict(extra="forbid")

    deviceId: str = Field(min_length=1)


class DeviceRegisterPushParams(BaseModel):
    model_config = ConfigDict(extra="forbid")

    deviceId: str = Field(min_length=1)
    pushToken: str = Field(min_length=1)


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


class AccountsConnectParams(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        alias_generator=to_camel,
        populate_by_name=True,
    )

    account_id: str = Field(alias="accountId", min_length=1)
    connector_id: str = Field(alias="connectorId", min_length=1)
    provider_account_id: str = Field(alias="providerAccountId", min_length=1)
    mode: str = Field(min_length=1)
    label: str = Field(min_length=1)
    allowed_symbols: list[str] = Field(alias="allowedSymbols", default_factory=list)


class AccountIdParams(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        alias_generator=to_camel,
        populate_by_name=True,
    )

    account_id: str = Field(alias="accountId", min_length=1)


class FeedSubscribeParams(BaseModel):
    model_config = ConfigDict(extra="forbid")

    topics: list[str] = Field(min_length=1)
    symbols: list[str] = Field(default_factory=list)
    timeframes: list[str] = Field(default_factory=list)


class FeedUnsubscribeParams(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        alias_generator=to_camel,
        populate_by_name=True,
    )

    subscription_id: str = Field(alias="subscriptionId", min_length=1)


class FeedGetCandlesParams(BaseModel):
    model_config = ConfigDict(extra="forbid")

    symbol: str = Field(min_length=1)
    timeframe: str = Field(min_length=1)
    limit: int = Field(default=200, ge=1, le=500)


class ConfigPatchParams(BaseModel):
    model_config = ConfigDict(extra="forbid")

    patch: dict[str, Any] = Field(default_factory=dict)


class AgentsCreateParams(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        alias_generator=to_camel,
        populate_by_name=True,
    )

    agent_id: str = Field(alias="agentId", min_length=1)
    label: str = Field(min_length=1)
    soul_template: str = Field(alias="soulTemplate", min_length=1)
    manual_template: str = Field(alias="manualTemplate", min_length=1)


class AgentsGetParams(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        alias_generator=to_camel,
        populate_by_name=True,
    )

    agent_id: str = Field(alias="agentId", min_length=1)


class CopytradeSignalParams(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        alias_generator=to_camel,
        populate_by_name=True,
    )

    signal_id: str = Field(alias="signalId", min_length=1)
    strategy_id: str = Field(alias="strategyId", min_length=1)
    ts: str = Field(min_length=1)
    symbol: str = Field(min_length=1)
    timeframe: str = Field(min_length=1)
    action: Literal["OPEN", "MODIFY", "CLOSE"]
    side: Literal["buy", "sell"]
    volume: float = Field(gt=0)
    entry: float
    stop_loss: float = Field(alias="stopLoss")
    take_profit: float = Field(alias="takeProfit")


class CopytradeConstraintsParams(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        alias_generator=to_camel,
        populate_by_name=True,
    )

    allowed_symbols: list[str] = Field(alias="allowedSymbols", default_factory=list)
    max_volume: float = Field(alias="maxVolume", gt=0)
    direction_filter: Literal["both", "long-only", "short-only"] = Field(
        alias="directionFilter",
        default="both",
    )
    max_signal_age_seconds: int = Field(alias="maxSignalAgeSeconds", ge=1)


class CopytradePreviewParams(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        alias_generator=to_camel,
        populate_by_name=True,
    )

    account_id: str = Field(alias="accountId", min_length=1)
    signal: CopytradeSignalParams
    constraints: CopytradeConstraintsParams


class MarketplaceFollowParams(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        alias_generator=to_camel,
        populate_by_name=True,
    )

    account_id: str = Field(alias="accountId", min_length=1)
    strategy_id: str = Field(alias="strategyId", min_length=1)


class MarketplaceMyFollowsParams(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        alias_generator=to_camel,
        populate_by_name=True,
    )

    account_id: str = Field(alias="accountId", min_length=1)


class CopytradeControlParams(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        alias_generator=to_camel,
        populate_by_name=True,
    )

    account_id: str = Field(alias="accountId", min_length=1)
    strategy_id: str = Field(alias="strategyId", min_length=1)


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


def _deep_merge(base: dict[str, Any], patch: dict[str, Any]) -> dict[str, Any]:
    merged = dict(base)
    for key, value in patch.items():
        current = merged.get(key)
        if isinstance(current, dict) and isinstance(value, dict):
            merged[key] = _deep_merge(current, value)
        else:
            merged[key] = value
    return merged


def _get_or_create_queue(agent_id: str, queues: dict[str, AgentQueue]) -> tuple[AgentQueue, bool]:
    if agent_id in queues:
        return queues[agent_id], False
    queue = AgentQueue(QueueSettings(mode="followup", cap=50, drop_policy="old"))
    queues[agent_id] = queue
    return queue, True


async def handle_gateway_websocket(
    websocket: WebSocket,
    *,
    started_at: datetime,
    agent_queues: dict[str, AgentQueue],
    queue_snapshot_store: QueueSnapshotStore,
    audit_store: AuditStore,
    agent_registry: AgentRegistry,
    account_registry: AccountRegistry,
    app_config: AppConfig,
    device_registry: DeviceRegistry,
    feed_service: FeedService,
    memory_index: MemoryIndex,
    resolved_plugins: ResolvedPlugins,
    risk_control_state: RiskControlState,
    trade_execution_service: TradeExecutionService,
) -> None:
    await websocket.accept()

    connected = False
    session_id: str | None = None
    risk_engine = RiskEngine()
    backtest_simulator = BacktestSimulator()
    marketplace_follows: dict[tuple[str, str], dict[str, Any]] = {}

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

        if frame.method == "config.schema":
            await websocket.send_json(
                _ok_response(
                    frame.id,
                    payload={"schema": AppConfig.model_json_schema()},
                )
            )
            continue

        if frame.method == "config.patch":
            try:
                params = ConfigPatchParams.model_validate(frame.params)
            except ValidationError:
                await websocket.send_json(
                    _error_response(
                        frame.id,
                        code="INVALID_PARAMS",
                        message="invalid config.patch params",
                    )
                )
                continue

            merged_payload = _deep_merge(app_config.model_dump(mode="json"), params.patch)
            try:
                app_config = AppConfig.model_validate(merged_payload)
            except ValidationError as exc:
                await websocket.send_json(
                    _error_response(
                        frame.id,
                        code="INVALID_PARAMS",
                        message="invalid config patch payload",
                        details={"errors": exc.errors()},
                    )
                )
                continue

            audit_store.append(
                actor="user",
                action="config.patch",
                trace_id=frame.id,
                data={"patchKeys": sorted(params.patch.keys())},
            )
            await websocket.send_json(
                _ok_response(
                    frame.id,
                    payload={"config": app_config.model_dump(mode="json")},
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

        if frame.method == "agents.create":
            try:
                params = AgentsCreateParams.model_validate(frame.params)
            except ValidationError:
                await websocket.send_json(
                    _error_response(
                        frame.id,
                        code="INVALID_PARAMS",
                        message="invalid agents.create params",
                    )
                )
                continue

            agent = agent_registry.create(
                agent_id=params.agent_id,
                label=params.label,
                soul_template=params.soul_template,
                manual_template=params.manual_template,
            )
            payload = {"agent": agent_registry.as_public_payload(agent)}
            audit_store.append(
                actor="user",
                action="agents.create",
                trace_id=frame.id,
                data={"agentId": params.agent_id, "label": params.label},
            )
            await websocket.send_json(
                _event_frame(
                    "event.agent.status",
                    {"requestId": frame.id, "agent": payload["agent"]},
                )
            )
            await websocket.send_json(_ok_response(frame.id, payload=payload))
            continue

        if frame.method == "agents.list":
            payload = {
                "agents": [
                    agent_registry.as_public_payload(agent)
                    for agent in agent_registry.list()
                ]
            }
            await websocket.send_json(_ok_response(frame.id, payload=payload))
            continue

        if frame.method == "agents.get":
            try:
                params = AgentsGetParams.model_validate(frame.params)
            except ValidationError:
                await websocket.send_json(
                    _error_response(
                        frame.id,
                        code="INVALID_PARAMS",
                        message="invalid agents.get params",
                    )
                )
                continue

            agent = agent_registry.get(agent_id=params.agent_id)
            if agent is None:
                await websocket.send_json(
                    _error_response(
                        frame.id,
                        code="NOT_FOUND",
                        message=f"agent not found: {params.agent_id}",
                    )
                )
                continue

            await websocket.send_json(
                _ok_response(
                    frame.id,
                    payload={"agent": agent_registry.as_public_payload(agent)},
                )
            )
            continue

        if frame.method == "accounts.connect":
            try:
                params = AccountsConnectParams.model_validate(frame.params)
            except ValidationError:
                await websocket.send_json(
                    _error_response(
                        frame.id,
                        code="INVALID_PARAMS",
                        message="invalid accounts.connect params",
                    )
                )
                continue

            account = account_registry.connect(
                account_id=params.account_id,
                connector_id=params.connector_id,
                provider_account_id=params.provider_account_id,
                mode=params.mode,
                label=params.label,
                allowed_symbols=params.allowed_symbols,
            )
            payload = {"account": account_registry.as_public_payload(account)}
            audit_store.append(
                actor="user",
                action="accounts.connect",
                trace_id=frame.id,
                data={
                    "accountId": params.account_id,
                    "connectorId": params.connector_id,
                    "mode": params.mode,
                },
            )
            await websocket.send_json(
                _event_frame(
                    "event.account.status",
                    {"requestId": frame.id, "account": payload["account"]},
                )
            )
            await websocket.send_json(_ok_response(frame.id, payload=payload))
            continue

        if frame.method == "accounts.list":
            payload = {
                "accounts": [
                    account_registry.as_public_payload(account)
                    for account in account_registry.list()
                ]
            }
            await websocket.send_json(_ok_response(frame.id, payload=payload))
            continue

        if frame.method in {"accounts.get", "accounts.status"}:
            try:
                params = AccountIdParams.model_validate(frame.params)
            except ValidationError:
                await websocket.send_json(
                    _error_response(
                        frame.id,
                        code="INVALID_PARAMS",
                        message=f"invalid {frame.method} params",
                    )
                )
                continue

            account = account_registry.get(account_id=params.account_id)
            if account is None:
                await websocket.send_json(
                    _error_response(
                        frame.id,
                        code="NOT_FOUND",
                        message=f"account not found: {params.account_id}",
                    )
                )
                continue

            await websocket.send_json(
                _ok_response(
                    frame.id,
                    payload={"account": account_registry.as_public_payload(account)},
                )
            )
            continue

        if frame.method == "accounts.disconnect":
            try:
                params = AccountIdParams.model_validate(frame.params)
            except ValidationError:
                await websocket.send_json(
                    _error_response(
                        frame.id,
                        code="INVALID_PARAMS",
                        message="invalid accounts.disconnect params",
                    )
                )
                continue

            account = account_registry.disconnect(account_id=params.account_id)
            if account is None:
                await websocket.send_json(
                    _error_response(
                        frame.id,
                        code="NOT_FOUND",
                        message=f"account not found: {params.account_id}",
                    )
                )
                continue

            payload = {"account": account_registry.as_public_payload(account)}
            audit_store.append(
                actor="user",
                action="accounts.disconnect",
                trace_id=frame.id,
                data={"accountId": params.account_id},
            )
            await websocket.send_json(
                _event_frame(
                    "event.account.status",
                    {"requestId": frame.id, "account": payload["account"]},
                )
            )
            await websocket.send_json(_ok_response(frame.id, payload=payload))
            continue

        if frame.method == "feeds.list":
            await websocket.send_json(
                _ok_response(
                    frame.id,
                    payload={
                        "feeds": feed_service.list_feeds(),
                        "subscriptions": feed_service.list_subscriptions(),
                    },
                )
            )
            continue

        if frame.method == "feeds.subscribe":
            try:
                params = FeedSubscribeParams.model_validate(frame.params)
            except ValidationError:
                await websocket.send_json(
                    _error_response(
                        frame.id,
                        code="INVALID_PARAMS",
                        message="invalid feeds.subscribe params",
                    )
                )
                continue

            subscription = feed_service.subscribe(
                topics=params.topics,
                symbols=params.symbols,
                timeframes=params.timeframes,
            )
            payload = {
                "subscription": feed_service.as_subscription_payload(subscription),
                "subscriptionCount": len(feed_service.list_subscriptions()),
            }
            audit_store.append(
                actor="user",
                action="feeds.subscribe",
                trace_id=frame.id,
                data={
                    "subscriptionId": subscription.subscription_id,
                    "topics": params.topics,
                },
            )
            await websocket.send_json(
                _event_frame(
                    "event.feed.event",
                    {
                        "requestId": frame.id,
                        "action": "subscribed",
                        "subscription": payload["subscription"],
                    },
                )
            )
            await websocket.send_json(_ok_response(frame.id, payload=payload))
            continue

        if frame.method == "feeds.unsubscribe":
            try:
                params = FeedUnsubscribeParams.model_validate(frame.params)
            except ValidationError:
                await websocket.send_json(
                    _error_response(
                        frame.id,
                        code="INVALID_PARAMS",
                        message="invalid feeds.unsubscribe params",
                    )
                )
                continue

            removed = feed_service.unsubscribe(subscription_id=params.subscription_id)
            if not removed:
                await websocket.send_json(
                    _error_response(
                        frame.id,
                        code="NOT_FOUND",
                        message=f"subscription not found: {params.subscription_id}",
                    )
                )
                continue

            audit_store.append(
                actor="user",
                action="feeds.unsubscribe",
                trace_id=frame.id,
                data={"subscriptionId": params.subscription_id},
            )
            await websocket.send_json(
                _event_frame(
                    "event.feed.event",
                    {
                        "requestId": frame.id,
                        "action": "unsubscribed",
                        "subscriptionId": params.subscription_id,
                    },
                )
            )
            await websocket.send_json(
                _ok_response(
                    frame.id,
                    payload={
                        "status": "removed",
                        "subscriptionId": params.subscription_id,
                        "subscriptionCount": len(feed_service.list_subscriptions()),
                    },
                )
            )
            continue

        if frame.method == "feeds.getCandles":
            try:
                params = FeedGetCandlesParams.model_validate(frame.params)
            except ValidationError:
                await websocket.send_json(
                    _error_response(
                        frame.id,
                        code="INVALID_PARAMS",
                        message="invalid feeds.getCandles params",
                    )
                )
                continue

            candles = feed_service.get_candles(
                symbol=params.symbol,
                timeframe=params.timeframe,
                limit=params.limit,
            )
            audit_store.append(
                actor="user",
                action="feeds.getCandles",
                trace_id=frame.id,
                data={
                    "symbol": params.symbol,
                    "timeframe": params.timeframe,
                    "limit": params.limit,
                },
            )
            await websocket.send_json(
                _ok_response(
                    frame.id,
                    payload={
                        "symbol": params.symbol,
                        "timeframe": params.timeframe,
                        "candles": candles,
                    },
                )
            )
            continue

        if frame.method == "marketplace.signals":
            now_iso = datetime.now(UTC).isoformat()
            signals = [
                {
                    "signalId": "sig_marketplace_1",
                    "strategyId": "strat_momentum_1",
                    "ts": now_iso,
                    "symbol": "ETHUSDm",
                    "timeframe": "5m",
                    "action": "OPEN",
                    "side": "buy",
                    "volume": 0.15,
                    "entry": 2500.0,
                    "stopLoss": 2450.0,
                    "takeProfit": 2600.0,
                },
                {
                    "signalId": "sig_marketplace_2",
                    "strategyId": "strat_mean_reversion_1",
                    "ts": now_iso,
                    "symbol": "BTCUSDm",
                    "timeframe": "1h",
                    "action": "OPEN",
                    "side": "sell",
                    "volume": 0.1,
                    "entry": 61000.0,
                    "stopLoss": 62000.0,
                    "takeProfit": 59000.0,
                },
            ]
            audit_store.append(
                actor="user",
                action="marketplace.signals",
                trace_id=frame.id,
                data={"signalCount": len(signals)},
            )
            await websocket.send_json(
                _ok_response(
                    frame.id,
                    payload={"signals": signals},
                )
            )
            continue

        if frame.method == "marketplace.follow":
            try:
                params = MarketplaceFollowParams.model_validate(frame.params)
            except ValidationError:
                await websocket.send_json(
                    _error_response(
                        frame.id,
                        code="INVALID_PARAMS",
                        message="invalid marketplace.follow params",
                    )
                )
                continue

            follow_key = (params.account_id, params.strategy_id)
            existing = marketplace_follows.get(follow_key)
            followed_at = datetime.now(UTC).isoformat()
            paused = (
                existing["paused"]
                if existing and isinstance(existing.get("paused"), bool)
                else False
            )
            follow_entry = {
                "followId": existing["followId"] if existing else f"follow_{uuid4().hex[:8]}",
                "accountId": params.account_id,
                "strategyId": params.strategy_id,
                "paused": paused,
                "copytradeStatus": "paused" if paused else "active",
                "updatedAt": followed_at,
            }
            marketplace_follows[follow_key] = follow_entry
            audit_store.append(
                actor="user",
                action="marketplace.follow",
                trace_id=frame.id,
                data={
                    "accountId": params.account_id,
                    "strategyId": params.strategy_id,
                    "followId": follow_entry["followId"],
                },
            )
            await websocket.send_json(
                _event_frame(
                    "event.marketplace.follow",
                    {"requestId": frame.id, **follow_entry},
                )
            )
            await websocket.send_json(
                _ok_response(
                    frame.id,
                    payload={"status": "following", **follow_entry},
                )
            )
            continue

        if frame.method == "marketplace.unfollow":
            try:
                params = MarketplaceFollowParams.model_validate(frame.params)
            except ValidationError:
                await websocket.send_json(
                    _error_response(
                        frame.id,
                        code="INVALID_PARAMS",
                        message="invalid marketplace.unfollow params",
                    )
                )
                continue

            follow_key = (params.account_id, params.strategy_id)
            existing = marketplace_follows.pop(follow_key, None)
            unfollowed_at = datetime.now(UTC).isoformat()
            follow_payload = {
                "followId": existing["followId"] if existing else None,
                "accountId": params.account_id,
                "strategyId": params.strategy_id,
                "status": "unfollowed",
                "updatedAt": unfollowed_at,
                "removed": existing is not None,
            }
            audit_store.append(
                actor="user",
                action="marketplace.unfollow",
                trace_id=frame.id,
                data={
                    "accountId": params.account_id,
                    "strategyId": params.strategy_id,
                    "removed": existing is not None,
                },
            )
            await websocket.send_json(
                _event_frame(
                    "event.marketplace.unfollow",
                    {"requestId": frame.id, **follow_payload},
                )
            )
            await websocket.send_json(
                _ok_response(
                    frame.id,
                    payload=follow_payload,
                )
            )
            continue

        if frame.method == "marketplace.myFollows":
            try:
                params = MarketplaceMyFollowsParams.model_validate(frame.params)
            except ValidationError:
                await websocket.send_json(
                    _error_response(
                        frame.id,
                        code="INVALID_PARAMS",
                        message="invalid marketplace.myFollows params",
                    )
                )
                continue

            follows = [
                follow
                for follow in marketplace_follows.values()
                if follow["accountId"] == params.account_id
            ]
            follows.sort(key=lambda item: item["strategyId"])
            audit_store.append(
                actor="user",
                action="marketplace.myFollows",
                trace_id=frame.id,
                data={
                    "accountId": params.account_id,
                    "followCount": len(follows),
                },
            )
            await websocket.send_json(
                _ok_response(
                    frame.id,
                    payload={"follows": follows},
                )
            )
            continue

        if frame.method == "copytrade.preview":
            try:
                params = CopytradePreviewParams.model_validate(frame.params)
            except ValidationError:
                await websocket.send_json(
                    _error_response(
                        frame.id,
                        code="INVALID_PARAMS",
                        message="invalid copytrade.preview params",
                    )
                )
                continue

            signal = CopyTradeSignal(
                signal_id=params.signal.signal_id,
                strategy_id=params.signal.strategy_id,
                ts=params.signal.ts,
                symbol=params.signal.symbol,
                timeframe=params.signal.timeframe,
                action=params.signal.action,
                side=params.signal.side,
                volume=params.signal.volume,
                entry=params.signal.entry,
                stop_loss=params.signal.stop_loss,
                take_profit=params.signal.take_profit,
            )
            mapper = CopyTradeMapper(
                constraints=FollowerConstraints(
                    allowed_symbols=params.constraints.allowed_symbols or [params.signal.symbol],
                    max_volume=params.constraints.max_volume,
                    direction_filter=params.constraints.direction_filter,
                    max_signal_age_seconds=params.constraints.max_signal_age_seconds,
                )
            )
            result = mapper.map_signal(signal=signal, account_id=params.account_id)
            result_payload = {
                "signalId": params.signal.signal_id,
                "deduped": result.deduped,
                "blockedReason": result.blocked_reason,
                "intent": result.intent.model_dump(mode="json") if result.intent else None,
            }
            audit_store.append(
                actor="user",
                action="copytrade.preview",
                trace_id=frame.id,
                data={
                    "accountId": params.account_id,
                    "signalId": params.signal.signal_id,
                    "blockedReason": result.blocked_reason,
                    "deduped": result.deduped,
                },
            )
            await websocket.send_json(
                _event_frame(
                    "event.copytrade.preview",
                    {"requestId": frame.id, **result_payload},
                )
            )
            await websocket.send_json(_ok_response(frame.id, payload=result_payload))
            continue

        if frame.method == "copytrade.status":
            try:
                params = CopytradeControlParams.model_validate(frame.params)
            except ValidationError:
                await websocket.send_json(
                    _error_response(
                        frame.id,
                        code="INVALID_PARAMS",
                        message="invalid copytrade.status params",
                    )
                )
                continue

            follow = marketplace_follows.get((params.account_id, params.strategy_id))
            if follow is None:
                await websocket.send_json(
                    _error_response(
                        frame.id,
                        code="NOT_FOUND",
                        message="copytrade follow not found",
                    )
                )
                continue

            status_payload = {
                "followId": follow["followId"],
                "accountId": follow["accountId"],
                "strategyId": follow["strategyId"],
                "paused": follow["paused"],
                "status": "paused" if follow["paused"] else "active",
                "updatedAt": follow["updatedAt"],
            }
            audit_store.append(
                actor="user",
                action="copytrade.status",
                trace_id=frame.id,
                data=status_payload,
            )
            await websocket.send_json(_ok_response(frame.id, payload=status_payload))
            continue

        if frame.method == "copytrade.pause":
            try:
                params = CopytradeControlParams.model_validate(frame.params)
            except ValidationError:
                await websocket.send_json(
                    _error_response(
                        frame.id,
                        code="INVALID_PARAMS",
                        message="invalid copytrade.pause params",
                    )
                )
                continue

            follow = marketplace_follows.get((params.account_id, params.strategy_id))
            if follow is None:
                await websocket.send_json(
                    _error_response(
                        frame.id,
                        code="NOT_FOUND",
                        message="copytrade follow not found",
                    )
                )
                continue

            follow["paused"] = True
            follow["copytradeStatus"] = "paused"
            follow["updatedAt"] = datetime.now(UTC).isoformat()
            status_payload = {
                "followId": follow["followId"],
                "accountId": follow["accountId"],
                "strategyId": follow["strategyId"],
                "paused": True,
                "status": "paused",
                "updatedAt": follow["updatedAt"],
            }
            audit_store.append(
                actor="user",
                action="copytrade.pause",
                trace_id=frame.id,
                data=status_payload,
            )
            await websocket.send_json(
                _event_frame(
                    "event.copytrade.execution",
                    {"requestId": frame.id, "action": "pause", "status": status_payload},
                )
            )
            await websocket.send_json(_ok_response(frame.id, payload=status_payload))
            continue

        if frame.method == "copytrade.resume":
            try:
                params = CopytradeControlParams.model_validate(frame.params)
            except ValidationError:
                await websocket.send_json(
                    _error_response(
                        frame.id,
                        code="INVALID_PARAMS",
                        message="invalid copytrade.resume params",
                    )
                )
                continue

            follow = marketplace_follows.get((params.account_id, params.strategy_id))
            if follow is None:
                await websocket.send_json(
                    _error_response(
                        frame.id,
                        code="NOT_FOUND",
                        message="copytrade follow not found",
                    )
                )
                continue

            follow["paused"] = False
            follow["copytradeStatus"] = "active"
            follow["updatedAt"] = datetime.now(UTC).isoformat()
            status_payload = {
                "followId": follow["followId"],
                "accountId": follow["accountId"],
                "strategyId": follow["strategyId"],
                "paused": False,
                "status": "active",
                "updatedAt": follow["updatedAt"],
            }
            audit_store.append(
                actor="user",
                action="copytrade.resume",
                trace_id=frame.id,
                data=status_payload,
            )
            await websocket.send_json(
                _event_frame(
                    "event.copytrade.execution",
                    {"requestId": frame.id, "action": "resume", "status": status_payload},
                )
            )
            await websocket.send_json(_ok_response(frame.id, payload=status_payload))
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

        if frame.method == "risk.status":
            await websocket.send_json(
                _ok_response(
                    frame.id,
                    payload=risk_control_state.status_payload(),
                )
            )
            continue

        if frame.method == "risk.emergencyStop":
            try:
                params = RiskEmergencyStopParams.model_validate(frame.params)
            except ValidationError:
                await websocket.send_json(
                    _error_response(
                        frame.id,
                        code="INVALID_PARAMS",
                        message="invalid risk.emergencyStop params",
                    )
                )
                continue

            emergency_payload = risk_control_state.activate_emergency_stop(
                action=params.action,
                reason=params.reason,
            )
            audit_store.append(
                actor="user",
                action="risk.emergencyStop",
                trace_id=frame.id,
                data={
                    "action": params.action,
                    "reason": params.reason,
                    "emergencyStopActive": emergency_payload["emergencyStopActive"],
                },
            )
            await websocket.send_json(
                _event_frame(
                    "event.risk.emergencyStop",
                    {
                        "requestId": frame.id,
                        "status": emergency_payload,
                    },
                )
            )
            if params.action == "cancel_all":
                await websocket.send_json(
                    _event_frame(
                        "event.trade.canceled",
                        {
                            "requestId": frame.id,
                            "scope": "all",
                            "status": "initiated",
                        },
                    )
                )
            if params.action == "close_all":
                await websocket.send_json(
                    _event_frame(
                        "event.trade.closed",
                        {
                            "requestId": frame.id,
                            "scope": "all",
                            "status": "initiated",
                        },
                    )
                )
            if params.action == "disable_live":
                await websocket.send_json(
                    _event_frame(
                        "event.risk.alert",
                        {
                            "requestId": frame.id,
                            "kind": "live_trading_disabled",
                            "status": "active",
                        },
                    )
                )
            await websocket.send_json(_ok_response(frame.id, payload=emergency_payload))
            continue

        if frame.method == "risk.resume":
            try:
                params = RiskResumeParams.model_validate(frame.params)
            except ValidationError:
                await websocket.send_json(
                    _error_response(
                        frame.id,
                        code="INVALID_PARAMS",
                        message="invalid risk.resume params",
                    )
                )
                continue

            resumed_payload = risk_control_state.resume(reason=params.reason)
            audit_store.append(
                actor="user",
                action="risk.resume",
                trace_id=frame.id,
                data={
                    "reason": params.reason,
                    "emergencyStopActive": resumed_payload["emergencyStopActive"],
                },
            )
            await websocket.send_json(
                _event_frame(
                    "event.risk.emergencyStop",
                    {
                        "requestId": frame.id,
                        "status": resumed_payload,
                    },
                )
            )
            await websocket.send_json(_ok_response(frame.id, payload=resumed_payload))
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

            queue, _ = _get_or_create_queue(params.agentId, agent_queues)
            request = AgentRequest(
                request_id=params.request.request_id,
                agent_id=params.agentId,
                kind=params.request.kind,
                priority=params.request.priority,
                dedupe_key=params.request.dedupe_key,
                payload=params.request.payload,
            )
            decision = queue.enqueue(request, now_ms=int(datetime.now(UTC).timestamp() * 1000))
            queue_snapshot_store.save(agent_queues)
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

            queue, created = _get_or_create_queue(params.agentId, agent_queues)
            if created:
                queue_snapshot_store.save(agent_queues)
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

        if frame.method == "devices.unpair":
            try:
                params = DeviceUnpairParams.model_validate(frame.params)
            except ValidationError:
                await websocket.send_json(
                    _error_response(
                        frame.id,
                        code="INVALID_PARAMS",
                        message="invalid devices.unpair params",
                    )
                )
                continue

            removed = device_registry.unpair(device_id=params.deviceId)
            if not removed:
                await websocket.send_json(
                    _error_response(
                        frame.id,
                        code="NOT_FOUND",
                        message=f"device not found: {params.deviceId}",
                    )
                )
                continue

            audit_store.append(
                actor="user",
                action="devices.unpair",
                trace_id=frame.id,
                data={"deviceId": params.deviceId},
            )
            await websocket.send_json(
                _ok_response(
                    frame.id,
                    payload={"status": "removed", "deviceId": params.deviceId},
                )
            )
            continue

        if frame.method == "devices.registerPush":
            try:
                params = DeviceRegisterPushParams.model_validate(frame.params)
            except ValidationError:
                await websocket.send_json(
                    _error_response(
                        frame.id,
                        code="INVALID_PARAMS",
                        message="invalid devices.registerPush params",
                    )
                )
                continue

            updated_device = device_registry.register_push(
                device_id=params.deviceId,
                push_token=params.pushToken,
            )
            if updated_device is None:
                await websocket.send_json(
                    _error_response(
                        frame.id,
                        code="NOT_FOUND",
                        message=f"device not found: {params.deviceId}",
                    )
                )
                continue

            payload = {"device": device_registry.as_public_payload(updated_device)}
            audit_store.append(
                actor="user",
                action="devices.registerPush",
                trace_id=frame.id,
                data={"deviceId": params.deviceId},
            )
            await websocket.send_json(_ok_response(frame.id, payload=payload))
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

            if risk_control_state.status_payload()["emergencyStopActive"]:
                emergency_status = risk_control_state.status_payload()
                emergency_decision = RiskDecision(
                    allowed=False,
                    violations=[
                        RiskViolation(
                            code=ViolationCode.EMERGENCY_STOP_ACTIVE,
                            message="Emergency stop is active.",
                            details={
                                "lastAction": emergency_status["lastAction"],
                                "updatedAt": emergency_status["updatedAt"],
                            },
                        )
                    ],
                )
                emergency_payload = emergency_decision.model_dump(mode="json")
                audit_store.append(
                    actor="user",
                    action="trades.place.blocked",
                    trace_id=frame.id,
                    data={"decision": emergency_payload},
                )
                await websocket.send_json(
                    _event_frame(
                        "event.risk.alert",
                        {
                            "requestId": frame.id,
                            "decision": emergency_payload,
                        },
                    )
                )
                await websocket.send_json(
                    _error_response(
                        frame.id,
                        code="RISK_BLOCKED",
                        message="trade blocked by emergency stop",
                        details={"decision": emergency_payload},
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
