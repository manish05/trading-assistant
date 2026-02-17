## Feeds and hooks (event-driven activation)

### 0) Why feeds + hooks

In OpenClaw, the agent is mostly triggered by messages and timers.

Trading is different:

- the “world” changes continuously (prices/candles/news)
- calling an LLM on every tick is expensive and unnecessary

So we use a two-stage pipeline:

1) **Feeds** produce normalized events.
2) **Hooks** evaluate deterministically to decide:
   - ignore
   - wake the agent
   - auto-trade (optional)

This is our primary mechanism for:

- cost control
- safety
- modularity

---

### 1) FeedEvent envelope

All feeds emit the same envelope so downstream logic is connector-agnostic.

```json
{
  "eventId": "evt_...",
  "ts": "2026-02-17T03:05:00Z",
  "source": "metaapi",
  "topic": "market.candle.closed",
  "symbol": "ETHUSDm",
  "timeframe": "5m",
  "partitionKey": "metaapi:acct_123:ETHUSDm:5m",
  "payload": {}
}
```

#### 1.1 Required fields
- `eventId`: stable id used for dedupe
- `ts`: event timestamp
- `source`: which plugin emitted it
- `topic`: semantic event name
- `payload`: event-specific data

#### 1.2 Optional fields (recommended)
- `symbol`, `timeframe`
- `accountId` (if applicable)
- `sequence` (monotonic ordering within partition)
- `traceId` (ties together hook eval → agent run → trade execution)

---

### 2) Topic taxonomy

We use dot-delimited topics.

#### 2.1 Market topics
- `market.price.tick`
- `market.candle.updated`
- `market.candle.closed`
- `market.session.open`
- `market.session.close`

MVP recommendation:

- focus on `market.candle.closed` because it’s stable and avoids noisy triggers.
- add `market.price.tick` later for trailing stops or fast alerts.

#### 2.2 Account topics
- `account.position.opened`
- `account.position.closed`
- `account.order.placed`
- `account.order.filled`
- `account.order.canceled`
- `account.margin.changed`

#### 2.3 External topics (future)
- `social.tweet`
- `news.headline`
- `calendar.event`

#### 2.4 Marketplace / copy-trading topics (post-MVP, in scope)
- `copytrade.signal.opened` (leader entry)
- `copytrade.signal.modified` (leader modifies SL/TP/size)
- `copytrade.signal.closed` (leader exit)
- `marketplace.strategy.updated` (strategy metadata/performance updates)

---

### 3) Feed implementations (sources)

Feed sources can be:

- **streaming** (connector pushes ticks)
- **polling** (gateway queries candles on a schedule)
- **replay** (backtest runs over historical events)

The event bus does not care; it consumes `FeedEvent` objects.

For MetaAPI (MVP):

- polling `get_candles` is sufficient to emit `market.candle.closed`
- streaming `subscribe_price` is optional

---

### 4) Hook types

We define two hook categories.

#### 4.1 Wake Hooks (WH)
Purpose:

- decide whether to wake the agent

Output:

- `IGNORE`
- `WAKE`
- `ALERT` (optional; emits UI alert without waking agent)

#### 4.2 AutoTrade Hooks (ATH)
Purpose:

- produce a deterministic trade intent without LLM involvement

Output:

- `IGNORE`
- `TRADE_INTENT`
- `ALERT`

Important: every `TRADE_INTENT` still goes through the **RiskEngine**.

#### 4.3 CopyTrade Hooks (CTH) (specialized AutoTrade Hook)
Purpose:

- deterministic **signal mirroring**: map leader signals (from `copytrade.signal.*`) into follower `TradeIntent`s
- preserve safety: copy-trade cannot bypass hard risk constraints

Key properties:

- **Idempotent mapping**: each leader signal id maps to at most one follower execution action
- **Follower constraints**: can filter symbols/timeframes/direction and apply sizing rules (with caps)
- **Reconciliation**: must handle leader edits/closures, partial fills, and rejected follower orders

---

### 5) Hook file structure (agent workspace)

For each agent:

- `agents/<agentId>/hooks/wake_*.py`
- `agents/<agentId>/hooks/autotrade_*.py`
- `agents/<agentId>/hooks/copytrade_*.py` (post-MVP)

Hooks are versioned artifacts:

- every change creates a new “hook revision” record
- revisions are referenced in audit logs and backtests

---

### 6) Hook runtime API (Python)

Hooks run in a sandboxed Python environment.

Minimal required signature:

```python
def evaluate(event, state):
    \"\"\"Return a dict decision.\"\"\"
    ...
```

Where:

- `event` is the `FeedEvent` payload as a Python dict
- `state` is a read-only view into relevant caches:
  - recent candles
  - open positions/orders
  - indicator cache
  - last hook outputs

Return shape (Wake Hook):

```python
return {
    "decision": "WAKE",   # or IGNORE / ALERT
    "reason": "Two consecutive green candles",
    "dedupeKey": "two_green:ETHUSDm:5m:2026-02-17T03:05:00Z",
    "cooldownSeconds": 60
}
```

Return shape (AutoTrade Hook):

```python
return {
    "decision": "TRADE_INTENT",
    "reason": "Doji reversal pattern detected",
    "intent": {
        "action": "PLACE_LIMIT_ORDER",
        "symbol": "ETHUSDm",
        "side": "buy",
        "volume": 0.01,
        "openPrice": 1000.0,
        "stopLoss": 990.0,
        "takeProfit": 1020.0
    },
    "dedupeKey": "...",
    "cooldownSeconds": 300
}
```

Guidance:

- keep hooks deterministic
- keep them fast
- do not call external networks from hooks
- use `dedupeKey` so retries don’t duplicate actions

---

### 7) Sandbox, timeouts, and safety

Hooks are executable code. We must sandbox them.

Minimum MVP constraints:

- execution timeout (e.g., 100–300ms)
- memory limit
- restricted builtins and imports
- no filesystem writes by default

Execution should happen:

- in a separate process (preferred)
- with a strict API boundary (stdin/out)

If a hook crashes or times out:

- record a hook error event
- apply backoff
- optionally pause the agent after repeated failures

---

### 8) Scheduling and candle-close emission

For polled candles:

- poll interval must be smaller than timeframe
  - 5m candles: poll every 30–60s
  - 1h candles: poll every 2–5 minutes

Candle-close detection:

- dedupe by `(symbol, timeframe, closeTime)`
- emit exactly once per candle close
- maintain a small “last seen closeTime” per partitionKey

Server time alignment:

- use connector server time when possible
- avoid relying solely on local wall clock

---

### 9) Cost-control patterns

Hooks are cheap; the LLM is expensive.

We reduce LLM calls via:

- wake prerequisites (e.g., “two green candles”)
- cool-downs after “no trade” decisions
- per-agent budget: max runs/hour
- batching triggers via queue mode `collect`
- scheduled “audit runs” (e.g., every 10 minutes) instead of constant runs

---

### 10) Hook evaluation logs (auditability)

Every hook evaluation writes a record:

- hook id + revision
- event id
- decision + reason
- runtime ms
- error details (if any)

This makes it possible to answer:

- “why did the agent wake?”
- “why didn’t it wake?”
- “why did it auto-trade?”

These records should be visible in the UI (advanced tab) without cluttering the main feed.

