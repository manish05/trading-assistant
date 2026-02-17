## UI spec — Web dashboard (v2 MVP)

### 1) Design goals

- **Clarity over cleverness**: a trader should understand what the agent is doing at a glance.
- **Auditability**: every trade marker on the chart links to a rationale + risk check + run record.
- **Intervention-first**: user can quickly pause/cancel/override without hunting.
- **Low clutter**: the “chat” is not a generic chatbot; it’s a **control + reporting stream**.

---

### 2) Information architecture (IA)

#### Primary navigation

- **Dashboard** (per agent)
  - Chart + overlays
  - Agent feed (blocks)
  - Positions/orders
  - Journal
- **Agents**
  - Create
  - List
  - Permissions (accounts/symbols)
- **Accounts**
  - Connect/manage broker accounts
  - Health
- **Backtests**
  - Reports list
  - Compare runs
- **Marketplace** (copy-trading + strategy packs)
  - Browse strategies/traders
  - Strategy detail (performance, risk, fees, rules)
  - Follow/unfollow + follower settings
  - My follows (status, audit)
- **Settings**
  - Global: auth, notifications, storage
  - Per-agent: hard constraints

---

### 3) Dashboard layout (single agent view)

Recommended 3-panel layout:

#### Left: Market panel (chart)
- Symbol selector (favorites + search)
- Timeframe selector (1m/5m/15m/1h/4h/1d)
- Candlestick chart
- Overlays:
  - executed trades (entry/exit markers)
  - pending orders (limit/stop)
  - SL/TP bands
  - agent annotations (zones, levels)
- Hover on marker shows:
  - trade id
  - entry/exit
  - size
  - SL/TP
  - P&L
  - link: “Open rationale” (opens right panel section)

#### Right: Agent panel (feed + control)
Tabs (default: Feed):
- **Feed**: streaming blocks (see `docs/specs/BLOCKS_SPEC.md`)
- **Control**: quick commands (pause, cancel orders, close position)
- **Journal**: agent’s daily logs and “learnings”
- **Memory**: search + citations into manual/journal

Chat input is placed at the bottom of the right panel and is treated as:

- a “control message”
- an instruction update
- or a question

Not all messages should wake the LLM. Some map to deterministic actions.

#### Bottom: Account/trading status panel
- Account health (connected / syncing / error)
- Balance/equity/margin
- Open positions list
- Pending orders list
- Risk status:
  - max daily loss remaining
  - max trades remaining
  - emergency stop state

#### Mobile-first consideration (web first)
- Dashboard should be **responsive** and usable on mobile web for monitoring and emergency controls.
- The same block stream should render cleanly on small screens (collapsible cards, sticky emergency bar).

---

### 4) “Blocks” UX (key idea)

Instead of long text responses, the gateway/agent emits **blocks** that the UI renders as cards.

Examples:

- **TradeProposal** card
  - setup summary
  - entry/SL/TP
  - risk check preview
  - buttons: Approve / Reject / Modify
- **RiskAlert** card
  - why trade was blocked
  - which constraint triggered
- **BacktestReport** card
  - equity curve mini-chart
  - metrics table
  - “Open full report”
- **Artifact** card
  - created hook file
  - created strategy script
  - diff preview

Blocks keep the dashboard readable and make it easy to take action.

---

### 5) Settings philosophy (minimal but essential)

We avoid over-configuring the strategy (that belongs in the agent manual). Settings are for **hard constraints** and **operational knobs**.

#### Per-agent settings (recommended)
- **Execution mode**: `paper` / `demo` / `live`
- **Allowed accounts**: list of connected accounts
- **Allowed symbols/timeframes**: allowlist
- **Order types**: allow/deny (market/limit/stop)

#### Marketplace follower settings (copy-trading)
- **Follow mode**: mirror entries+exits / mirror entries only / manual exits
- **Direction filter**: long-only / short-only / both
- **Sizing mode**: fixed lots, fixed risk per trade, or proportional to leader (with caps)
- **Max slippage** and **max concurrent positions** (hard caps)

#### Mobile settings (global)
- Paired devices list
- Push notification preferences (approvals, fills, risk alerts, emergency)
- **Risk limits**:
  - max trades per day
  - max concurrent positions
  - max position size
  - max daily loss
- **Queue mode**: followup/interrupt/collect/steer-backlog
- **Run budgets**:
  - max LLM runs per hour
  - cooldown after “no trade”
- **Notifications**:
  - notify on trade placed
  - notify on risk stop
  - notify on connector disconnect

#### Global settings
- Gateway authentication method
- Data retention (days)
- Memory indexing options (FTS only vs hybrid)
- Default emergency stop policy
- External feed credentials (social/news)

---

### 6) UI components to build (MVP)

- **ChartView**
  - candles
  - overlays
  - hover inspector
- **PositionsTable**, **OrdersTable**
- **AgentFeed** (block renderer)
- **ControlComposer** (command presets + freeform)
- **JournalViewer**
- **MemorySearch** (query → citations)
- **BacktestViewer**
- **AccountConnectorWizard**
- **AgentCreatorWizard**
- **EmergencyStopPanel**

---

### 7) UX edge cases

- Connector disconnected: chart still shows last known data; trading disabled; show reconnect status.
- Market closed: show “market closed” banner; block order placement.
- Risk stop reached: show sticky “Paused by risk policy”.
- Conflicting commands: if user sends “cancel order” while agent is placing it, the queue mode determines priority.

