## Backtesting (deterministic strategy evaluation)

### 0) Why backtesting is first-class

If the agent can propose or generate strategies, we need a fast way to evaluate:

- “does this work historically?”
- “what are the failure modes?”

Backtesting is also a safety feature:

- it prevents deploying untested auto-trade hooks blindly

MVP focus:

- backtest deterministic **AutoTrade Hooks** and strategy scripts.

---

### 1) Inputs

A backtest run is defined by:

- `accountId` (data source)
- `symbol`
- `timeframe`
- `startTime`, `endTime`
- strategy artifact reference:
  - `agents/<agentId>/hooks/autotrade_*.py` or `strategies/*.py`
- execution assumptions:
  - spread/slippage model (simple first)
  - commission (optional)
  - order fill model (simplified)

---

### 2) Data acquisition

For MetaAPI:

- use `get_candles` repeatedly to fetch the range

Requirements:

- data must be cached for repeatability
- backtest must record dataset hash

Backtest data should be stored as:

- raw candles
- derived features (optional)

---

### 3) Simulation model (MVP)

We start simple:

- run over candles sequentially
- strategy evaluates on candle close
- generate entries/exits
- compute P&L

We can evolve later to:

- intrabar simulation
- partial fills
- complex order types

The important MVP property:

- deterministic and explainable

---

### 4) Output: BacktestReport

Backtest outputs:

- summary metrics
- equity curve
- trade list
- drawdown series

Key metrics (MVP):

- total return
- max drawdown
- win rate
- profit factor
- average R multiple
- number of trades
- average holding time

The gateway emits:

- a `BacktestReport` UI block (see `docs/specs/BLOCKS_SPEC.md`)
- stores the report as an artifact for later review
- indexes the report summary in memory

---

### 5) Reproducibility

Each backtest run record must include:

- strategy artifact revision
- dataset hash
- gateway version
- connector version
- simulation assumptions

This avoids “it worked yesterday” confusion.

---

### 6) Relationship to the live agent

Backtesting and live trading share artifacts:

- the same strategy/hook files
- the same indicator functions

But live trading has additional constraints:

- risk engine
- connector limitations
- execution delays

The agent should treat backtest results as evidence, not as proof.

