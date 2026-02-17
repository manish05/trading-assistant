## User flows

### Conventions used in this doc

- **UI**: web dashboard client
- **Gateway**: backend control-plane server (WS JSON-RPC + events)
- **Connector**: broker/data-feed plugin (MetaAPI first)
- **Agent**: a configured trading persona + protocol + hooks + memory
- **Hook**: deterministic Python trigger/evaluator (cheap, sandboxed)

---

### Flow A — First-time onboarding (demo-first)

#### A1) User lands on the app
- UI shows:
  - “Create demo session”
  - “Connect live account (advanced)”
- UI explains:
  - live trading requires explicit opt-in
  - all actions are logged and reversible where possible

#### A2) Create a demo account connection
- User enters:
  - MetaAPI token
  - MT5 credentials
  - marks account as `demo`
  - (optional) account id
- UI calls `accounts.connect` (Gateway → Connector).
- Gateway validates:
  - credentials
  - connector health
  - account deploy/sync state
- UI receives `event.account.status` updates until ready.

#### A3) Create first agent
- UI prompts:
  - agent name
  - symbols/timeframes
  - default risk limits
  - queue mode (default: `steer-backlog`)
- Gateway creates:
  - `agents/<agentId>/SOUL.md`
  - `agents/<agentId>/TRADING_MANUAL.md`
  - `agents/<agentId>/hooks/` skeleton
  - journal + memory directories
- UI navigates to dashboard for the agent.

#### A4) Start monitoring (no trading yet)
- UI toggles:
  - “Enable feed ingestion”
  - “Enable hook evaluation”
  - “Enable auto-trade hooks” (default OFF)
  - “Enable AI trading” (default OFF)
- User watches:
  - live candles
  - connector status
  - hook evaluations
  - agent “idle” state

#### A5) Enable demo trading
- User explicitly toggles “Allow demo execution”.
- Gateway enforces:
  - demo flag true
  - risk constraints configured
  - emergency stop configured
- System begins executing only demo actions.

---

### Flow B — Rule-gated AI trading (two green candles)

Goal: user wants an AI agent but only when a prerequisite holds.

#### B1) User writes rule as intent + hook
- User chat input:
  - “Trade every 15 minutes and look at 5m candles.”
  - “Never trade unless the last two 5m candles are green.”
- System stores natural-language protocol in `TRADING_MANUAL.md`.
- System creates/updates a wake hook file:
  - `hooks/wake_two_green_5m.py`
  - subscribes to `candle.closed` for `5m`

#### B2) Data arrives → hook evaluation
- Connector emits `FeedEvent(topic=candle.closed, timeframe=5m)`.
- Hook runtime executes wake hook:
  - reads last N candles
  - returns `WAKE` only when the prerequisite is met
- If not met: only an evaluation record is logged.

#### B3) Wake triggers → agent run queued
- Gateway enqueues `AgentRequest(kind=hook_trigger, triggerId=...)`.
- Per-agent queue mode applies:
  - if agent is busy:
    - `followup`: queue it
    - `interrupt`: abort and run new
    - `collect`: batch triggers for X seconds
    - `steer-backlog`: steer if active else queue

#### B4) Agent runs
Agent run context includes:
  - recent candles + indicator cache
  - open positions + pending orders
  - relevant memory/journal snippets
  - the hook that triggered
  - risk profile and allowed actions

Agent produces one of:
  - `NoTradeDecision` (with rationale)
  - `TradeProposal` block (ask user approval)
  - `TradeIntent` (auto-execute if permitted)

#### B5) Risk gate + execution
- If a trade intent exists:
  - Risk engine validates constraints (max size, loss limits, symbol allowlist).
  - Connector places order.
  - Gateway emits events:
    - `event.trade.intent`
    - `event.trade.executed` or `event.trade.rejected`
- UI overlays the trade on chart.

#### B6) User intervention mid-trade
- User types:
  - “Cancel the limit order.”
  - “Move SL to breakeven when price reaches X.”
- These become `AgentRequest(kind=user_control)` and are queued.
- Agent either:
  - executes immediately (if safe), or
  - schedules a hook (“when price reaches X then …”).

---

### Flow C — Emergency scenario (news / volatility / failure)

#### C1) User hits emergency stop
- UI has a dedicated “Emergency stop” panel with presets:
  - Cancel all pending orders
  - Close all open positions
  - Pause agent
  - Pause all agents
- UI calls `risk.emergencyStop`.
- Gateway executes deterministic actions first (no LLM required).
- Gateway emits `event.emergency_stop` and marks agents paused.

#### C2) System triggers emergency stop automatically
Triggers include:
  - connector reports repeated trade failures
  - max daily loss reached
  - news blackout window
  - repeated hook runtime errors
  - LLM tool policy violation attempt
- Gateway pauses agent and emits an alert block.

---

### Flow D — Social trigger (Elon tweet)

#### D1) User configures social feed
- User adds a social feed plugin (future): `feed.x_twitter`.
- User configures:
  - allowed authors (Elon)
  - keyword sets
  - rate limits

#### D2) Tweet arrives → hook filters
- Social feed plugin emits `FeedEvent(topic=social.tweet, payload=tweet)`.
- Hook checks:
  - author == Elon
  - keyword match
- If matched: wake agent with tweet payload + relevant market context.

---

### Flow E — Auto-trade strategy (no LLM per event)

#### E1) User asks AI to create an auto strategy
- User: “Create an algo strategy: three-candle doji → enter.”
- Agent responds with:
  - Python strategy artifact in `strategies/`
  - Auto-trade hook in `hooks/auto_doji_entry.py`
  - Risk gates to prevent runaway trading

#### E2) Auto-trade hook emits trade intents
- On each candle close, hook may emit `TradeIntent`.
- Gateway runs risk checks and executes.
- Agent is invoked periodically:
  - every N minutes
  - or after N trades
  - or on performance anomalies

This “audit invocation” is cost-controlled and gives the agent a chance to adapt.

---

### Flow F — Backtesting + report

#### F1) User requests backtest
- User: “Backtest auto_doji_entry for 90 days on BTCUSD 5m.”
- Gateway schedules a backtest job:
  - fetch candles
  - run deterministic strategy
  - compute metrics

#### F2) UI renders report block
- Gateway emits a `BacktestReport` block:
  - summary metrics
  - equity curve points
  - list of sample trades
- UI shows a dedicated “Backtest” viewer, not cluttering the chat.

---

### Flow G — Multi-agent operations

#### G1) User creates multiple agents for different tasks
- Agent A: discretionary BTC 5m
- Agent B: news-driven ETH 1h
- Agent C: auto-trade strategy

#### G2) Concurrency control
- Each agent has its own queue and run state.
- Each agent can have its own allowed accounts and symbols.
- Shared resources (connector connections, candle cache, memory index) are managed centrally by the gateway.

---

### Flow H — Copy-trading marketplace (leader signals → follower execution)

Goal: user wants to follow a strategy/trader, but keep hard risk controls.

#### H1) Browse + subscribe
- User opens “Marketplace” in the dashboard.
- User selects a strategy/trader and clicks “Follow (demo)” or “Follow (live)”.
- User sets follower constraints:
  - allowed symbols/timeframes
  - max position size / max concurrent positions
  - max daily loss / max drawdown
  - optional direction filter (only long/only short)
- Gateway creates a subscription:
  - `FeedSubscription(topic=copytrade.signal.*, source=strategyId)`
  - A per-agent/per-account **CopyTrade AutoTrade Hook** is enabled for this subscription.

#### H2) Signal arrives → deterministic copy hook
- Marketplace feed emits events:
  - `copytrade.signal.opened`
  - `copytrade.signal.modified`
  - `copytrade.signal.closed`
- Copy hook maps leader → follower intent:
  - order type mapping, SL/TP mapping, sizing mapping
  - idempotency: leaderSignalId must map to exactly one follower action
- Gateway runs RiskEngine checks and executes via connector.

#### H3) Transparency + intervention
- UI shows:
  - leader signal details
  - follower execution details (filled price, slippage, errors)
  - risk decisions (why a signal was rejected)
- User can pause/unfollow instantly, or temporarily “mirror only entries, manage exits manually”.

---

### Flow I — Mobile app (status, approvals, emergency control)

Goal: mobile is a first-class client; web ships first, but the protocol supports mobile from day one.

#### I1) Connect + authenticate
- User installs mobile app and signs in.
- Mobile app connects to the gateway over the same JSON-RPC protocol as web.
- User can pair device for push notifications and secure confirmations.

#### I2) Monitor + approve
- Mobile shows:
  - account health, P/L, open positions
  - agent status (running/paused), recent actions, current rationale blocks
- If the agent requests approval (e.g., `TradeProposal`):
  - mobile receives a push notification
  - user approves/denies with one tap

#### I3) Emergency stop
- Mobile has a prominent emergency control surface:
  - pause agent / pause all agents
  - cancel all pending orders
  - close all positions (with confirm)
- These are deterministic gateway actions (no LLM dependency).

