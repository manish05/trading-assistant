## Agents (workspaces, runs, subagents, journaling)

### 0) What an agent is

An agent is a **personal trader**:

- it has a persona (`SOUL.md`)
- it has protocols (`TRADING_MANUAL.md`)
- it has deterministic triggers (`hooks/`)
- it has memory and a journal (`journal/`, `memory/`)
- it has permissions and budgets (hard constraints)

This is inspired by OpenClaw’s dynamic prompt builder and `SOUL.md` persona loading (`https://www.globalbuilders.club/blog/openclaw-codebase-technical-guide`).

---

### 1) Agent workspace layout

For each agent id `agent_<name>`:

```text
agents/agent_<name>/
  SOUL.md
  TRADING_MANUAL.md
  hooks/
    wake_*.py
    autotrade_*.py
  strategies/
    *.py
  journal/
    daily/
      2026-02-17.md
    trade_logs/
      2026-02-17.md
    learnings.md
  memory/
    MEMORY.md
    notes/
      *.md
  artifacts/
    backtests/
    reports/
  state/
    agent_state.json
```

Principles:

- humans can read and edit these files
- every artifact is versioned
- agent behavior should be explainable from these docs + logs

---

### 2) `SOUL.md` (persona)

Purpose:

- define the agent’s tone and identity
- define how it communicates in the dashboard
- define its “style” of decision explanation

What it must NOT do:

- override hard risk constraints
- justify unsafe behavior

Examples of good `SOUL.md` content:

- “I speak in concise blocks, not long essays.”
- “I always show risk-reward and invalidation levels.”
- “If uncertain, I prefer no trade.”

---

### 3) `TRADING_MANUAL.md` (protocol)

Purpose:

- a living set of rules that define how the agent trades
- written as natural language, but enforceable portions should be mirrored in hard constraints

Recommended sections:

- **Setup definition**: what patterns count
- **Risk rules**: sizing, max loss, session times
- **Execution rules**: order types, SL/TP requirements
- **Management rules**: move to breakeven, trailing, partial exits
- **Emergency protocol**: what to do on news/volatility/disconnect
- **Journaling requirements**: what must be recorded

---

### 4) Run lifecycle

An agent run begins when:

- a wake hook triggers
- a user sends a control message
- a scheduled audit occurs

#### 4.1 Run phases

1. **Collect context**
   - market snapshot (candles, indicators)
   - account snapshot (positions, orders, margin)
   - relevant memory citations
   - recent journal entries
   - triggering event payload

2. **Reason** (LLM)
   - produce a decision
   - propose or create a trade intent
   - produce UI blocks

3. **Risk gate** (deterministic)
   - block/allow

4. **Execute** (connector)
   - place/modify/cancel/close

5. **Journal + audit**
   - append run record
   - append trade rationale
   - write audit entry

6. **Emit events**
   - run started / blocks / run completed

This mirrors OpenClaw’s “tool execution inside a loop”, but trading demands the explicit risk phase.

---

### 5) Tool policy (OpenClaw-inspired, trading-adapted)

OpenClaw uses a cascading tool policy where any deny blocks the tool.

For v2 we adopt the same “deny wins” principle with fewer layers:

- **Global policy**: overall system restrictions
- **Connector policy**: connector-specific restrictions
- **Account policy**: per account (demo/live)
- **Agent policy**: per agent
- **Run policy**: temporary restrictions for a specific run

Example:

- global: disallow live trading
- account: allow live
- agent: allow live

Result: live trading is still disallowed (global deny).

Why this matters:

- it prevents “oops” execution because a single config flipped
- it centralizes safety

---

### 6) Subagents (bounded parallelism)

Subagents are specialized child agents that can run tasks without blocking the main agent:

- research (news context)
- backtesting
- report generation
- strategy refactoring

Rules:

- subagents inherit equal-or-more restrictive policies
- subagent depth is limited
- subagent outputs must be attached to the parent run record

We borrow the concept from OpenClaw’s subagent registry.

---

### 7) Journaling model (auditability)

We separate:

- **daily journal**: what happened today, lessons
- **trade log**: each trade with setup, entry/exit, screenshot references
- **learnings**: long-lived rules and corrections

Minimum required trade log fields:

- timestamp
- symbol/timeframe
- trigger reason
- entry, SL, TP
- size
- risk-reward
- outcome
- “why” narrative

Every executed action must be linked:

- tradeId ↔ runId ↔ audit entries

---

### 8) Human intervention as first-class input

User inputs should be treated as:

- deterministic commands (cancel order)
- protocol updates (update manual)
- questions (explain why)

Not every input should wake the LLM.

If the user writes:

- “Cancel order 123”

…the gateway should execute deterministically (after risk checks) and only then optionally notify the agent.

