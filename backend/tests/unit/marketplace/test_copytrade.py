from datetime import UTC, datetime, timedelta

from app.marketplace.copytrade import (
    CopyTradeMapper,
    CopyTradeSignal,
    FollowerConstraints,
)


def test_mapper_creates_trade_intent_with_volume_caps() -> None:
    mapper = CopyTradeMapper(
        constraints=FollowerConstraints(
            allowed_symbols=["ETHUSDm"],
            max_volume=0.2,
            direction_filter="both",
            max_signal_age_seconds=300,
        )
    )

    signal = CopyTradeSignal(
        signal_id="sig_1",
        strategy_id="strat_1",
        ts=datetime.now(UTC).isoformat(),
        symbol="ETHUSDm",
        timeframe="5m",
        action="OPEN",
        side="buy",
        volume=0.5,
        entry=2500.0,
        stop_loss=2450.0,
        take_profit=2600.0,
    )

    result = mapper.map_signal(signal=signal, account_id="acct_demo_1")

    assert result.deduped is False
    assert result.blocked_reason is None
    assert result.intent is not None
    assert result.intent.volume == 0.2


def test_mapper_blocks_stale_signal() -> None:
    mapper = CopyTradeMapper(
        constraints=FollowerConstraints(
            allowed_symbols=["ETHUSDm"],
            max_volume=0.2,
            direction_filter="both",
            max_signal_age_seconds=60,
        )
    )

    stale_time = datetime.now(UTC) - timedelta(minutes=5)
    signal = CopyTradeSignal(
        signal_id="sig_2",
        strategy_id="strat_1",
        ts=stale_time.isoformat(),
        symbol="ETHUSDm",
        timeframe="5m",
        action="OPEN",
        side="buy",
        volume=0.1,
        entry=2500.0,
        stop_loss=2450.0,
        take_profit=2600.0,
    )

    result = mapper.map_signal(signal=signal, account_id="acct_demo_1")

    assert result.intent is None
    assert result.blocked_reason == "SIGNAL_STALE"


def test_mapper_dedupes_signal_ids() -> None:
    mapper = CopyTradeMapper(
        constraints=FollowerConstraints(
            allowed_symbols=["ETHUSDm"],
            max_volume=0.2,
            direction_filter="both",
            max_signal_age_seconds=300,
        )
    )

    signal = CopyTradeSignal(
        signal_id="sig_3",
        strategy_id="strat_1",
        ts=datetime.now(UTC).isoformat(),
        symbol="ETHUSDm",
        timeframe="5m",
        action="OPEN",
        side="buy",
        volume=0.1,
        entry=2500.0,
        stop_loss=2450.0,
        take_profit=2600.0,
    )

    first = mapper.map_signal(signal=signal, account_id="acct_demo_1")
    second = mapper.map_signal(signal=signal, account_id="acct_demo_1")

    assert first.intent is not None
    assert second.intent is None
    assert second.deduped is True
