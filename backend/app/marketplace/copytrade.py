from __future__ import annotations

from dataclasses import dataclass, field
from datetime import UTC, datetime
from typing import Literal

from app.risk.engine import TradeIntent


@dataclass(slots=True)
class CopyTradeSignal:
    signal_id: str
    strategy_id: str
    ts: str
    symbol: str
    timeframe: str
    action: Literal["OPEN", "MODIFY", "CLOSE"]
    side: Literal["buy", "sell"]
    volume: float
    entry: float
    stop_loss: float
    take_profit: float


@dataclass(slots=True)
class FollowerConstraints:
    allowed_symbols: list[str]
    max_volume: float
    direction_filter: Literal["both", "long-only", "short-only"] = "both"
    max_signal_age_seconds: int = 300


@dataclass(slots=True)
class CopyTradeMappingResult:
    intent: TradeIntent | None
    blocked_reason: str | None = None
    deduped: bool = False


@dataclass(slots=True)
class CopyTradeMapper:
    constraints: FollowerConstraints
    processed_signal_ids: set[str] = field(default_factory=set)

    def map_signal(self, *, signal: CopyTradeSignal, account_id: str) -> CopyTradeMappingResult:
        if signal.signal_id in self.processed_signal_ids:
            return CopyTradeMappingResult(intent=None, deduped=True)

        if signal.action != "OPEN":
            return CopyTradeMappingResult(intent=None, blocked_reason="UNSUPPORTED_ACTION")

        if signal.symbol not in self.constraints.allowed_symbols:
            return CopyTradeMappingResult(intent=None, blocked_reason="SYMBOL_NOT_ALLOWED")

        if self.constraints.direction_filter == "long-only" and signal.side != "buy":
            return CopyTradeMappingResult(intent=None, blocked_reason="DIRECTION_FILTER_BLOCK")

        if self.constraints.direction_filter == "short-only" and signal.side != "sell":
            return CopyTradeMappingResult(intent=None, blocked_reason="DIRECTION_FILTER_BLOCK")

        signal_ts = datetime.fromisoformat(signal.ts.replace("Z", "+00:00")).astimezone(UTC)
        age_seconds = (datetime.now(UTC) - signal_ts).total_seconds()
        if age_seconds > self.constraints.max_signal_age_seconds:
            return CopyTradeMappingResult(intent=None, blocked_reason="SIGNAL_STALE")

        normalized_volume = min(signal.volume, self.constraints.max_volume)
        intent = TradeIntent(
            account_id=account_id,
            symbol=signal.symbol,
            action="PLACE_MARKET_ORDER",
            side=signal.side,
            volume=normalized_volume,
            stop_loss=signal.stop_loss,
            take_profit=signal.take_profit,
        )
        self.processed_signal_ids.add(signal.signal_id)
        return CopyTradeMappingResult(intent=intent)
