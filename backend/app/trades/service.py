from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import UTC, datetime
from uuid import uuid4

from app.risk.engine import TradeIntent


@dataclass(slots=True)
class TradeExecution:
    execution_id: str
    intent_id: str | None
    status: str
    provider_order_id: str
    ts: str


class TradeExecutionService:
    def place(self, *, intent: TradeIntent) -> TradeExecution:
        return TradeExecution(
            execution_id=f"exec_{uuid4().hex[:12]}",
            intent_id=f"intent_{uuid4().hex[:12]}",
            status="executed",
            provider_order_id=f"order_{uuid4().hex[:12]}",
            ts=datetime.now(UTC).isoformat(),
        )

    def modify(
        self,
        *,
        account_id: str,
        order_id: str,
        open_price: float,
        stop_loss: float | None = None,
        take_profit: float | None = None,
    ) -> TradeExecution:
        _ = (account_id, open_price, stop_loss, take_profit)
        return TradeExecution(
            execution_id=f"exec_{uuid4().hex[:12]}",
            intent_id=None,
            status="modified",
            provider_order_id=order_id,
            ts=datetime.now(UTC).isoformat(),
        )

    def cancel(self, *, account_id: str, order_id: str) -> TradeExecution:
        _ = account_id
        return TradeExecution(
            execution_id=f"exec_{uuid4().hex[:12]}",
            intent_id=None,
            status="canceled",
            provider_order_id=order_id,
            ts=datetime.now(UTC).isoformat(),
        )

    def close_position(self, *, account_id: str, position_id: str) -> TradeExecution:
        _ = account_id
        return TradeExecution(
            execution_id=f"exec_{uuid4().hex[:12]}",
            intent_id=None,
            status="closed",
            provider_order_id=position_id,
            ts=datetime.now(UTC).isoformat(),
        )

    @staticmethod
    def as_payload(execution: TradeExecution) -> dict:
        payload = asdict(execution)
        return {
            "executionId": payload["execution_id"],
            "intentId": payload["intent_id"],
            "status": payload["status"],
            "providerOrderId": payload["provider_order_id"],
            "ts": payload["ts"],
        }
