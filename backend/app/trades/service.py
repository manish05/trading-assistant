from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import UTC, datetime
from uuid import uuid4

from app.risk.engine import TradeIntent


@dataclass(slots=True)
class TradeExecution:
    execution_id: str
    intent_id: str
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
