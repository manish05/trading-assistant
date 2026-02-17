## Agent queues (modes, dedupe, budgets)

### 0) Why queues exist

OpenClaw has an auto-reply pipeline that routes messages through a queue with different modes (`steer`, `interrupt`, `followup`, `collect`, `steer-backlog`).

Trading needs the same idea because:

- feed events can arrive faster than the agent can reason
- users can intervene while an agent run is executing
- some actions must preempt everything (emergency stop)

So we give every agent its own **queue + run state**.

---

### 1) What is queued: AgentRequest

An `AgentRequest` is the unit of work for an agent.

```json
{
  "requestId": "ar_...",
  "createdAt": "2026-02-17T03:10:00Z",
  "agentId": "agent_btc_5m",
  "kind": "hook_trigger",
  "priority": "normal",
  "dedupeKey": "two_green:BTCUSD:5m:2026-02-17T03:10:00Z",
  "payload": {}
}
```

#### 1.1 Kinds (MVP)
- `user_control`: user typed a control message
- `hook_trigger`: wake hook fired
- `scheduled_audit`: periodic audit run
- `system_alert`: connector disconnect, risk stop, etc.

#### 1.2 Priority
- `high`: emergency stop, cancel order
- `normal`: hook triggers, normal user input
- `low`: scheduled audits

Priority affects preemption and drop policy.

---

### 2) Queue modes (OpenClaw-inspired)

We adopt the same conceptual modes.

#### 2.1 `followup`
- If agent is idle: run immediately.
- If agent is busy: enqueue and run after current run completes.

Good for:

- stable sequential operation
- avoiding run aborts

#### 2.2 `interrupt`
- If agent is busy: abort current run and start the new one.

Good for:

- urgent human intervention

Risk:

- may waste LLM tokens

Rule:

- only allow `interrupt` for `priority=high` requests.

#### 2.3 `collect`
- Batch requests for `debounceMs`, then run once with an aggregated payload.

Good for:

- noisy feeds (many triggers)
- reducing cost

Example:

- collect 10 price ticks into a “micro-summary” and run once.

#### 2.4 `steer`
- If agent supports streaming “steer” behavior, inject new request context into the active run.

In practice for v2 MVP:

- we may not implement true steer initially.
- we can approximate steer by `interrupt` or `followup`.

#### 2.5 `steer-backlog`
- If agent is busy: try steer; if not possible, enqueue.
- If agent is idle: run immediately.

Recommended MVP default.

#### 2.6 `queue` (simple FIFO)
- Always enqueue; worker drains FIFO.

Mostly useful for deterministic pipelines.

---

### 3) Dedupe and drop policies

Feeds can produce repeated triggers or retries.

#### 3.1 Dedupe
Each request may include `dedupeKey`.

Dedupe strategies:

- `messageId`: dedupe by upstream message id
- `dedupeKey`: dedupe by hook-provided key
- `none`: never dedupe

MVP recommendation:

- dedupe `hook_trigger` by `dedupeKey`
- dedupe `user_control` by request id only

#### 3.2 Capacity caps
Each queue has a `cap`.

When cap is reached, apply `dropPolicy`:

- `old`: drop oldest pending
- `new`: drop newest incoming
- `summarize`: summarize old ones into a single request (advanced)

MVP defaults:

- `cap=50`
- `dropPolicy=old`

---

### 4) Budgets and backoff (cost control)

Each agent has execution budgets:

- max LLM runs per hour
- max runs per day
- cooldown after “no trade”

When budgets are exceeded:

- queue still accepts requests (for audit)
- but LLM runs are suppressed
- gateway emits a `RiskAlert` or `SystemStatus` block explaining the pause

---

### 5) Two-lane model (recommended safety refinement)

Not all work should wait behind LLM reasoning.

We recommend two lanes:

- **Control lane (deterministic)**: cancel order, pause agent, emergency stop
- **Reasoning lane (LLM)**: strategy evaluation, proposal generation

This prevents a long LLM run from blocking a critical deterministic action.

Implementation options:

- separate queues
- or a single queue with priority + deterministic fast-path

---

### 6) Observability

Queue metrics per agent:

- pending count
- oldest age
- active run duration
- abort count
- drop count
- dedupe count

Expose via:

- gateway status
- UI advanced panel

This is how we debug “agent feels stuck”.

