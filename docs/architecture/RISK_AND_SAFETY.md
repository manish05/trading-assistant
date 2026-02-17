## Risk and safety (hard guardrails)

### 0) Principle: hard constraints beat LLM instructions

We treat the LLM as a fallible collaborator.

Therefore:

- the agent can *suggest*
- but deterministic code must *enforce*

Every trade intent—whether produced by:

- the AI agent
- an AutoTrade Hook
- a user deterministic action

…must pass through the RiskEngine.

---

### 1) Execution modes (safety posture)

Per agent:

- `paper`: simulate only
- `demo`: execute only on demo accounts
- `live`: execute on live accounts (explicit opt-in)

Default:

- `paper`

Even in `live` we may require:

- explicit per-trade approval
- or allow autopilot within constraints

Approval surface (in scope):

- web dashboard first
- mobile approvals later (same gateway protocol; push + confirm), treated as deterministic gating (no LLM dependency)

---

### 2) Risk policy categories

#### 2.1 Symbol and account allowlists
- allowed accounts
- allowed symbols
- allowed timeframes (for signal generation)

If a symbol is not allowed, trade is blocked.

#### 2.2 Position sizing constraints
- max volume (lots)
- max notional exposure
- max leverage
- max concurrent positions
- max per-symbol exposure

Risk engine should compute:

- margin requirements (connector may provide `calculate_margin`)

#### 2.3 Loss limits and circuit breakers
- max daily loss
- max drawdown
- pause after N consecutive losses
- pause after N connector errors

These must be computed from:

- account history
- realized/unrealized P&L

#### 2.4 Order hygiene
- SL required
- TP required (optional but recommended)
- minimum SL distance / invalid stops
- reject if stopLoss/takeProfit violate broker constraints

If order hygiene is violated:

- block
- emit `RiskAlert` block with details

#### 2.5 Trading session windows
- avoid certain hours
- avoid market close/open spikes
- news blackout windows (future)

#### 2.6 Copy-trading safety (post-MVP, in scope)

Copy-trading is treated as **untrusted external input** (a feed), not as an authority.

Hard constraints for follower execution:

- **Follower constraints always win**: symbols, direction, sizing caps, max concurrency, loss limits.
- **Signal staleness window**: reject signals older than \(T\) seconds/minutes for the instrument/timeframe.
- **Max slippage**: reject if expected slippage exceeds configured cap (or require approval).
- **Per-follow kill switch**: pause/unfollow must stop execution immediately and deterministically.
- **Idempotency**: each leader signal id must map to at most one follower execution action.

---

### 3) Emergency stop (must always work)

Emergency stop is deterministic and must not depend on the LLM.

Actions (configurable):

- pause agent
- pause all agents
- cancel all pending orders
- close all positions
- disable live trading globally

Triggers:

- user clicks emergency stop
- daily loss limit reached
- connector disconnect persists > threshold
- repeated trade failures
- hook runtime failures

Emergency stop emits:

- `event.emergency_stop`
- audit entry
- UI sticky banner

---

### 4) Risk evaluation outputs

RiskEngine returns a structured `RiskDecision`:

```json
{
  "allowed": false,
  "violations": [
    {
      "code": "MAX_DAILY_LOSS",
      "message": "Daily loss limit exceeded",
      "details": { "limit": 100, "current": 132 }
    }
  ],
  "computed": {
    "marginRequired": 123.45,
    "riskReward": 2.1
  }
}
```

If blocked:

- the gateway must *not* attempt execution
- the gateway emits a `RiskAlert` block
- the gateway writes an audit entry

---

### 5) Audit log requirements (append-only)

Any event that changes money/risk must be logged:

- connect/disconnect account
- change execution mode
- place/modify/cancel order
- close position
- emergency stop
- risk blocked decision

Audit entries should include:

- who initiated (user / agent / autotrade hook)
- runId and traceId
- intent payload
- risk decision
- connector response

Audit log is not “debug logging”; it is the truth source for operations.

---

### 6) Secret handling

- `.env` is always git-ignored.
- logs must not include tokens/passwords.
- UI should treat secrets as one-way inputs (never re-display).
- config system should support “sensitive” fields that are redacted.

---

### 7) Testing (TDD)

RiskEngine is one of the most important test targets.

Minimum TDD expectations:

- every violation code has a test
- tests cover both allow and block paths
- tests verify audit entries are written

Do not test mock behavior.

Reference: `https://raw.githubusercontent.com/obra/superpowers/refs/heads/main/skills/test-driven-development/testing-anti-patterns.md`

