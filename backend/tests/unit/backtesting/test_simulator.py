from app.backtesting.simulator import BacktestCandle, BacktestSimulator, TradeSignal


def test_simulator_generates_trade_and_report_metrics() -> None:
    candles = [
        BacktestCandle(ts="2026-01-01T00:00:00Z", open=100, high=102, low=99, close=101),
        BacktestCandle(ts="2026-01-01T00:05:00Z", open=101, high=106, low=100, close=105),
        BacktestCandle(ts="2026-01-01T00:10:00Z", open=105, high=107, low=104, close=106),
    ]

    def strategy(index: int, history: list[BacktestCandle]) -> TradeSignal | None:
        if index == 0:
            return TradeSignal(
                side="buy",
                entry=history[index].close,
                stop_loss=99,
                take_profit=105,
            )
        return None

    result = BacktestSimulator().run(candles=candles, strategy=strategy)

    assert result.metrics.trades == 1
    assert result.metrics.win_rate_pct == 100.0
    assert result.metrics.total_return_pct > 0
    assert result.trades[0].outcome == "win"


def test_simulator_tracks_drawdown_and_profit_factor() -> None:
    candles = [
        BacktestCandle(ts="2026-01-01T00:00:00Z", open=100, high=101, low=97, close=100),
        BacktestCandle(ts="2026-01-01T00:05:00Z", open=100, high=104, low=99, close=103),
        BacktestCandle(ts="2026-01-01T00:10:00Z", open=103, high=104, low=98, close=99),
        BacktestCandle(ts="2026-01-01T00:15:00Z", open=99, high=103, low=98, close=102),
    ]

    def strategy(index: int, history: list[BacktestCandle]) -> TradeSignal | None:
        if index == 0:
            return TradeSignal(
                side="buy",
                entry=history[index].close,
                stop_loss=98,
                take_profit=103,
            )
        if index == 2:
            return TradeSignal(
                side="buy",
                entry=history[index].close,
                stop_loss=98,
                take_profit=102,
            )
        return None

    result = BacktestSimulator().run(candles=candles, strategy=strategy)

    assert result.metrics.trades == 2
    assert result.metrics.max_drawdown_pct >= 0
    assert result.metrics.profit_factor > 0
