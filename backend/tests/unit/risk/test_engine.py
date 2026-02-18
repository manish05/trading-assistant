from app.risk.engine import (
    AccountRiskSnapshot,
    RiskEngine,
    RiskPolicy,
    TradeIntent,
    ViolationCode,
)


def _base_policy() -> RiskPolicy:
    return RiskPolicy(
        allowed_symbols=["ETHUSDm", "BTCUSDm"],
        max_volume=0.2,
        max_concurrent_positions=2,
        max_daily_loss=100.0,
        require_stop_loss=True,
    )


def _base_snapshot() -> AccountRiskSnapshot:
    return AccountRiskSnapshot(open_positions=1, daily_pnl=-20.0)


def _base_intent() -> TradeIntent:
    return TradeIntent(
        account_id="acct_demo_1",
        symbol="ETHUSDm",
        action="PLACE_MARKET_ORDER",
        side="buy",
        volume=0.1,
        stop_loss=2500.0,
        take_profit=2800.0,
    )


def test_risk_engine_allows_valid_intent() -> None:
    decision = RiskEngine().evaluate(
        intent=_base_intent(),
        policy=_base_policy(),
        snapshot=_base_snapshot(),
    )

    assert decision.allowed is True
    assert decision.violations == []


def test_risk_engine_blocks_disallowed_symbol() -> None:
    intent = _base_intent().model_copy(update={"symbol": "XAUUSDm"})

    decision = RiskEngine().evaluate(
        intent=intent,
        policy=_base_policy(),
        snapshot=_base_snapshot(),
    )

    assert decision.allowed is False
    assert decision.violations[0].code == ViolationCode.SYMBOL_NOT_ALLOWED


def test_risk_engine_blocks_missing_stop_loss_when_required() -> None:
    intent = _base_intent().model_copy(update={"stop_loss": None})

    decision = RiskEngine().evaluate(
        intent=intent,
        policy=_base_policy(),
        snapshot=_base_snapshot(),
    )

    assert decision.allowed is False
    assert decision.violations[0].code == ViolationCode.STOP_LOSS_REQUIRED


def test_risk_engine_blocks_volume_exceeding_limit() -> None:
    intent = _base_intent().model_copy(update={"volume": 0.5})

    decision = RiskEngine().evaluate(
        intent=intent,
        policy=_base_policy(),
        snapshot=_base_snapshot(),
    )

    assert decision.allowed is False
    assert decision.violations[0].code == ViolationCode.MAX_VOLUME_EXCEEDED


def test_risk_engine_blocks_concurrent_position_limit() -> None:
    snapshot = _base_snapshot().model_copy(update={"open_positions": 2})

    decision = RiskEngine().evaluate(
        intent=_base_intent(),
        policy=_base_policy(),
        snapshot=snapshot,
    )

    assert decision.allowed is False
    assert decision.violations[0].code == ViolationCode.MAX_CONCURRENT_POSITIONS


def test_risk_engine_blocks_when_daily_loss_limit_reached() -> None:
    snapshot = _base_snapshot().model_copy(update={"daily_pnl": -120.0})

    decision = RiskEngine().evaluate(
        intent=_base_intent(),
        policy=_base_policy(),
        snapshot=snapshot,
    )

    assert decision.allowed is False
    assert decision.violations[0].code == ViolationCode.MAX_DAILY_LOSS
