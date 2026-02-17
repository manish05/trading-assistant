from app.feeds.service import FeedService


def test_feed_service_subscribe_and_unsubscribe() -> None:
    service = FeedService()

    subscription = service.subscribe(
        topics=["market.candle.closed"],
        symbols=["ETHUSDm"],
        timeframes=["5m"],
    )
    removed = service.unsubscribe(subscription_id=subscription.subscription_id)

    assert subscription.subscription_id.startswith("sub_")
    assert removed is True


def test_feed_service_generates_candle_snapshots() -> None:
    service = FeedService()

    candles = service.get_candles(symbol="ETHUSDm", timeframe="5m", limit=4)

    assert len(candles) == 4
    assert candles[0]["symbol"] == "ETHUSDm"
    assert candles[0]["timeframe"] == "5m"
    assert candles[0]["open"] <= candles[0]["high"]
    assert candles[0]["low"] <= candles[0]["close"]
