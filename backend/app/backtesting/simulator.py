from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from typing import Literal


@dataclass(slots=True)
class BacktestCandle:
    ts: str
    open: float
    high: float
    low: float
    close: float


@dataclass(slots=True)
class TradeSignal:
    side: Literal["buy", "sell"]
    entry: float
    stop_loss: float
    take_profit: float


@dataclass(slots=True)
class BacktestTrade:
    entry_ts: str
    exit_ts: str
    side: Literal["buy", "sell"]
    entry: float
    exit: float
    stop_loss: float
    take_profit: float
    pnl: float
    outcome: Literal["win", "loss", "flat"]


@dataclass(slots=True)
class BacktestMetrics:
    total_return_pct: float
    max_drawdown_pct: float
    win_rate_pct: float
    profit_factor: float
    trades: int


@dataclass(slots=True)
class BacktestResult:
    trades: list[BacktestTrade]
    metrics: BacktestMetrics
    equity_curve: list[float]


StrategyFn = Callable[[int, list[BacktestCandle]], TradeSignal | None]


class BacktestSimulator:
    def run(
        self,
        *,
        candles: list[BacktestCandle],
        strategy: StrategyFn,
        starting_equity: float = 1_000.0,
    ) -> BacktestResult:
        equity = starting_equity
        equity_curve = [equity]
        trades: list[BacktestTrade] = []

        gross_profit = 0.0
        gross_loss = 0.0

        for index, candle in enumerate(candles):
            signal = strategy(index, candles)
            if signal is None:
                continue

            trade = self._simulate_trade(
                signal=signal,
                entry_ts=candle.ts,
                future_candles=candles[index + 1 :],
                fallback_candle=candles[-1],
            )
            trades.append(trade)

            equity += trade.pnl
            equity_curve.append(equity)

            if trade.pnl > 0:
                gross_profit += trade.pnl
            elif trade.pnl < 0:
                gross_loss += trade.pnl

        max_drawdown_pct = self._compute_max_drawdown_pct(equity_curve)
        wins = sum(1 for trade in trades if trade.outcome == "win")
        win_rate_pct = (wins / len(trades) * 100) if trades else 0.0
        profit_factor = (
            gross_profit / abs(gross_loss) if gross_loss != 0 else max(gross_profit, 0.0)
        )
        total_return_pct = (
            ((equity - starting_equity) / starting_equity * 100) if starting_equity else 0.0
        )

        return BacktestResult(
            trades=trades,
            equity_curve=equity_curve,
            metrics=BacktestMetrics(
                total_return_pct=round(total_return_pct, 4),
                max_drawdown_pct=round(max_drawdown_pct, 4),
                win_rate_pct=round(win_rate_pct, 4),
                profit_factor=round(profit_factor, 4),
                trades=len(trades),
            ),
        )

    def _simulate_trade(
        self,
        *,
        signal: TradeSignal,
        entry_ts: str,
        future_candles: list[BacktestCandle],
        fallback_candle: BacktestCandle,
    ) -> BacktestTrade:
        exit_price = fallback_candle.close
        exit_ts = fallback_candle.ts

        for candle in future_candles:
            if signal.side == "buy":
                if candle.low <= signal.stop_loss:
                    exit_price = signal.stop_loss
                    exit_ts = candle.ts
                    break
                if candle.high >= signal.take_profit:
                    exit_price = signal.take_profit
                    exit_ts = candle.ts
                    break
            else:
                if candle.high >= signal.stop_loss:
                    exit_price = signal.stop_loss
                    exit_ts = candle.ts
                    break
                if candle.low <= signal.take_profit:
                    exit_price = signal.take_profit
                    exit_ts = candle.ts
                    break

        pnl = exit_price - signal.entry if signal.side == "buy" else signal.entry - exit_price
        outcome: Literal["win", "loss", "flat"]
        if pnl > 0:
            outcome = "win"
        elif pnl < 0:
            outcome = "loss"
        else:
            outcome = "flat"

        return BacktestTrade(
            entry_ts=entry_ts,
            exit_ts=exit_ts,
            side=signal.side,
            entry=signal.entry,
            exit=exit_price,
            stop_loss=signal.stop_loss,
            take_profit=signal.take_profit,
            pnl=pnl,
            outcome=outcome,
        )

    @staticmethod
    def _compute_max_drawdown_pct(equity_curve: list[float]) -> float:
        peak = equity_curve[0] if equity_curve else 0.0
        max_drawdown = 0.0
        for equity in equity_curve:
            if equity > peak:
                peak = equity
            if peak > 0:
                drawdown = (peak - equity) / peak * 100
                max_drawdown = max(max_drawdown, drawdown)
        return max_drawdown
