## PRD — MT5 Claude Trader v2

### 1) Summary

MT5 Claude Trader v2 is a **personal trading agent platform** that lets a trader express intent in natural language (and lightweight hooks), and have an AI agent **observe markets, decide, execute, and manage trades** 24/7—while remaining **auditable, modular, and safe**.

This is “vibe coding for traders”:
- A trader stops doing UI labor (open MT5, click chart, type prices, adjust SL/TP, cancel orders).
- Instead, they define **protocols** (risk, rules, emergency procedures) and **goals**.
- The system runs continuously, with **event-driven triggers** so the LLM is called only when necessary.

We explicitly borrow core concepts from OpenClaw’s architecture—especially the **gateway**, **agent queues**, and **memory system**—and adapt them to trading. Reference: `https://www.globalbuilders.club/blog/openclaw-codebase-technical-guide`.

---

### 2) Problem statement

Today’s retail trading workflow is high-friction and error-prone:
- Manual placement of orders, SL/TP, and frequent monitoring.
- High cognitive load during volatility and news.
- Inability to consistently follow a written plan (fatigue, emotion).
- Poor journaling: rationale and review are often missing or incomplete.

Existing automation is either:
- Fully algorithmic (rigid rules, hard to iterate, requires coding), or
- A chat bot (no real execution, no safety guardrails, not integrated with broker state).

We want an assistant that is:
- **Integrated** (broker state + chart context + account state),
- **Protocol-driven** (explicit risk and emergency procedures),
- **Auditable** (why did it trade? what did it see?),
- **Composable/extensible** (new brokers/feeds/plugins),
- **Cost-controlled** (event-driven triggers + throttling + backoff).

---

### 3) Goals (what success looks like)

#### 3.1 Core goals (MVP)
- **Account connection**: connect a real or demo MT5 account via MetaAPI.
- **Real-time dashboard**: chart + executed trades plotted + live positions/orders + logs.
- **Agents**: create/manage multiple agents; each agent has `SOUL.md`, a trading manual, hooks, journal, and memory.
- **Event-driven activation**: ingest market data; run lightweight hooks on every feed event; wake agent only when hooks trigger.
- **Trade execution**: agent can place/modify/cancel orders through connector; all actions pass through a risk gate.
- **Intervention**: user can override (e.g., “cancel order”, “move SL to breakeven”), and the agent follows.
- **Audit + journal**: every decision and trade is recorded with context and rationale.

#### 3.2 “Feels magical” goals
- The agent continuously narrates its intent as a **structured stream of blocks** (not walls of text).
- The dashboard shows **why** a trade was taken: the rules satisfied, the signals, the risk check outcome.
- Backtesting is one command away: “Backtest this hook/strategy on last 90 days.”

---

### 4) Non-goals (explicitly out of scope for v2 MVP)

- Guaranteeing profitability.
- High-frequency trading (sub-second execution) on retail infrastructure.
- Supporting every broker and every exchange on day one.
- Complex portfolio optimization / multi-asset hedging engine (later).

#### 4.1 In scope (post-MVP, keep architecture open)

- **Copy-trading marketplace**: represented as a **signal/data feed** plus a dedicated **copy-trade auto-trading hook type** (follower accounts can subscribe; RiskEngine still enforces hard limits).
- **Full mobile apps**: iOS/Android clients are in scope; web dashboard ships first. The gateway protocol is designed to support mobile clients from day one.

---

### 5) Personas

- **Manual discretionary trader**: wants automation of execution + risk protocol; still wants to intervene and guide.
- **Semi-systematic trader**: wants triggers and partial automation; uses indicators and rules; wants backtests.
- **Algo-curious trader**: wants AI to generate/iterate on strategies; runs them in a controlled environment.
- **Operator/Power user**: manages multiple agents and accounts; wants deep logging and tool control.

---

### 6) Primary use cases (from your vision)

#### UC1 — Rule-gated discretionary agent (two green candles)
User says:
- “Trade every 15 minutes on 5m candles.”
- “Never trade unless there are two consecutive green 5m candles.”
- “If the rule is satisfied, you may still skip if it’s a bad trade, but you must journal why.”
System:
- Subscribes to `candle.closed` for symbol + timeframe.
- Hook filters events → wake agent only when the prerequisite is true.
- Agent runs: checks memory/manual, evaluates, proposes or executes trade.
- User can intervene: “Cancel it” / “Move SL to breakeven”.

#### UC2 — Social/news trigger (Elon tweet → evaluate trade)
User says:
- “Watch Elon Musk tweets; if crypto-related, evaluate bullish setup and trade if good.”
System:
- Subscribes to a social feed (plugin).
- Hook filters by author + keywords.
- Wakes agent with tweet payload + market context.

#### UC3 — Agent writes Python indicators/scripts
User says:
- “Create an indicator to detect X; run it on incoming candles; use it in decisions.”
System:
- Agent produces a Python artifact (versioned) in the agent workspace.
- Hook/runtime executes script on feed events.
- Results become part of context for future runs.

#### UC4 — Auto-trade hook (no LLM on each event)
User says:
- “Trade this rule-based strategy automatically; wake the AI every 10 minutes to audit.”
System:
- Strategy runs as an **AutoTrade Hook** (deterministic Python) that can emit trade intents directly.
- The AI agent is invoked on an interval or after N trades for oversight and adaptation.

#### UC5 — Backtesting + visualization
User says:
- “Backtest this strategy for the last 90 days and show results.”
System:
- Fetches historical candles, runs deterministic strategy, produces a `BacktestReport` block.
- UI renders equity curve + metrics + sample trades.

#### UC6 — Copy-trading marketplace (signals → follower execution)
User says:
- “Let me browse strategies/traders and copy-trade them on my demo account first.”
- “Only copy BTCUSD 5m trades, only long, and cap risk to $X per day.”
System:
- User selects a marketplace strategy/trader to follow (as a **signal feed subscription**).
- Gateway subscribes to `copytrade.signal.*` feed events (entries/modifications/exits).
- A deterministic **CopyTrade AutoTrade Hook** maps leader signals → follower `TradeIntent`s (with idempotency).
- RiskEngine enforces follower constraints (symbols, max size, max loss, max concurrency).
- UI shows leader signal + follower execution outcome with full audit trail.

---

### 7) Functional requirements

#### 7.1 Accounts & connectivity
- Add/remove trading accounts.
- Mark account as `demo` or `live`.
- Connector validates credentials and reports readiness/health.
- Connector provides: prices/candles, positions/orders, trade operations.

#### 7.2 Agents
- Create agent with:
  - name
  - connected account(s)
  - allowed symbols/timeframes
  - risk profile
  - queue mode
  - `SOUL.md` + trading manual + hooks
- Multiple agents can run concurrently.
- Agents can spawn subagents for research/backtest/report generation (bounded and auditable).

#### 7.3 Feeds
- Market feeds: candles, prices (poll or subscribe), ticks (optional), symbol specs.
- External feeds: social (Twitter/X), calendar/news (future).
- Feed events are normalized into a shared envelope so hooks and agents are connector-agnostic.

#### 7.4 Hooks
- Hook types:
  - **Wake hooks**: decide whether to invoke the agent
  - **Auto-trade hooks**: may emit trade intents without invoking the LLM
- Hooks are deterministic, cheap, sandboxed, and instrumented.
- Hooks can read current market/account state and computed indicators.

#### 7.5 AI runs & decisions
- An AI run produces:
  - a decision trace
  - optional trade intent(s)
  - optional UI blocks (charts, backtest report)
  - journal entries
- Runs are idempotent and repeatable where possible (snapshot inputs).

#### 7.6 Trade execution & management
- Standard actions: market order, limit order, stop orders, modify, cancel, close position.
- Trailing stop support where available (connector capability).
- Every trade action goes through a risk gate and is recorded in an audit log.

#### 7.7 Dashboard & interaction
- Chart (symbols + timeframes) with trade overlays and hover details.
- Right panel: agent feed (blocks), journal, logs, and chat/control input.
- Agent creation/management UI, account connection UI.
- Emergency stop: “cancel all orders”, “close positions”, “pause agent”.

#### 7.8 Copy-trading marketplace (post-MVP, in scope)
- Browse marketplace strategies/traders with performance + risk notes.
- Follow/unfollow with explicit follower constraints (hard caps).
- Signals represented as a feed (`copytrade.signal.*`), mirrored via a deterministic CopyTrade hook.
- Full transparency: leader signal → follower intent → risk decision → execution outcome (auditable).

#### 7.9 Mobile apps (post-MVP, in scope)
- iOS/Android clients connect via the same gateway protocol.
- Monitor agent/account status and view blocks stream.
- Approve/reject trade proposals via push notifications (optional gating for live mode).
- Emergency stop controls available on mobile (deterministic).

---

### 8) Non-functional requirements

#### 8.1 Safety & risk
- Default safe posture: paper/demo mode; explicit opt-in to live trading.
- Hard risk constraints enforced by code (not just LLM instruction).
- Emergency stop path always available.

#### 8.2 Security
- Secrets never stored in plaintext logs.
- `.env` is always git-ignored.
- Minimize network access for hook runtime; no exfiltration channels by default.

#### 8.3 Reliability
- System survives connector disconnects; reconnects with backoff.
- Durable audit trail (append-only log) and run records.
- Deterministic backtesting pipeline.

#### 8.4 Observability
- Structured logs and metrics for:
  - feed ingestion
  - hook evaluation
  - queue health
  - agent runs
  - trade execution
  - connector status
- Per-trade “why” record (inputs + rule satisfaction + risk outcome).

#### 8.5 Cost control (LLM)
- Event-driven wake hooks to avoid constant polling runs.
- Queue modes (`collect`, `followup`) to batch triggers.
- Cooldowns, max runs per hour, and backoff after repeated “no trade” decisions.

---

### 9) Settings philosophy (minimal but essential)

We keep “soft preferences” as **natural-language instructions** in the agent manual, but keep “hard constraints” as **settings** enforced by code.

Examples of *hard constraints* suitable for settings:
- Allowed symbols and timeframes
- Max trades per day / per symbol
- Max daily loss / max drawdown (account-level)
- Max position size and leverage
- Allowed order types
- Trading session windows (avoid illiquid hours)
- Emergency stop actions and notification channels

Everything else lives in:

- `SOUL.md` (persona / style)
- `TRADING_MANUAL.md` (protocol)
- `hooks/*.py` (wake logic / auto-trade logic)
- Journal + memory (learning)

---

### 10) Success metrics

- Time-to-first-demo-trade under 10 minutes (setup → agent → first simulated trade).
- 100% of executed trades have:
  - rationale
  - risk check record
  - chart context snapshot reference
  - journal entry
- LLM cost reduction:
  - LLM invoked only when hooks trigger (or scheduled audit), not on every tick.
- “Operator trust” metric:
  - user can answer “why did it do that?” from the UI without guessing.

---

### 11) Legal / disclaimers

- This is not financial advice.
- Users are responsible for enabling live trading.
- The system must present explicit warnings and require opt-in for live execution.

