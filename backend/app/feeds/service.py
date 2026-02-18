from __future__ import annotations

import re
from dataclasses import asdict, dataclass
from datetime import UTC, datetime
from uuid import uuid4

_TIMEFRAME_PATTERN = re.compile(r"^(\d+)([mhd])$")


@dataclass(slots=True)
class FeedSubscription:
    subscription_id: str
    topics: list[str]
    symbols: list[str]
    timeframes: list[str]
    created_at: str


class FeedService:
    def __init__(self) -> None:
        self._subscriptions: dict[str, FeedSubscription] = {}

    def list_feeds(self) -> list[dict]:
        return [
            {
                "feedId": "market.candles",
                "kind": "market",
                "topics": ["market.candle.closed", "market.tick"],
            },
            {
                "feedId": "trading.executions",
                "kind": "trade",
                "topics": ["trade.executed", "trade.rejected"],
            },
        ]

    def subscribe(
        self,
        *,
        topics: list[str],
        symbols: list[str],
        timeframes: list[str],
    ) -> FeedSubscription:
        subscription = FeedSubscription(
            subscription_id=f"sub_{uuid4().hex[:10]}",
            topics=list(topics),
            symbols=list(symbols),
            timeframes=list(timeframes),
            created_at=datetime.now(UTC).isoformat(),
        )
        self._subscriptions[subscription.subscription_id] = subscription
        return subscription

    def unsubscribe(self, *, subscription_id: str) -> bool:
        return self._subscriptions.pop(subscription_id, None) is not None

    def list_subscriptions(self) -> list[dict]:
        return [
            self.as_subscription_payload(subscription)
            for subscription in self._subscriptions.values()
        ]

    def get_candles(self, *, symbol: str, timeframe: str, limit: int) -> list[dict]:
        step_seconds = _timeframe_to_seconds(timeframe)
        now_epoch = int(datetime.now(UTC).timestamp())
        candles: list[dict] = []
        base_price = 2500.0

        for index in range(limit):
            ts_epoch = now_epoch - ((limit - index) * step_seconds)
            drift = index * 1.5
            open_price = base_price + drift
            close_price = open_price + (0.8 if index % 2 == 0 else -0.4)
            high_price = max(open_price, close_price) + 0.6
            low_price = min(open_price, close_price) - 0.6
            candles.append(
                {
                    "ts": datetime.fromtimestamp(ts_epoch, UTC).isoformat(),
                    "symbol": symbol,
                    "timeframe": timeframe,
                    "open": round(open_price, 5),
                    "high": round(high_price, 5),
                    "low": round(low_price, 5),
                    "close": round(close_price, 5),
                }
            )

        return candles

    @staticmethod
    def as_subscription_payload(subscription: FeedSubscription) -> dict:
        payload = asdict(subscription)
        return {
            "subscriptionId": payload["subscription_id"],
            "topics": payload["topics"],
            "symbols": payload["symbols"],
            "timeframes": payload["timeframes"],
            "createdAt": payload["created_at"],
        }


def _timeframe_to_seconds(timeframe: str) -> int:
    match = _TIMEFRAME_PATTERN.match(timeframe)
    if match is None:
        return 60

    value = int(match.group(1))
    unit = match.group(2)

    if unit == "m":
        return value * 60
    if unit == "h":
        return value * 60 * 60
    if unit == "d":
        return value * 60 * 60 * 24
    return 60
