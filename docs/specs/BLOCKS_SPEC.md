## Blocks spec (UI rendering contract)

### 0) Purpose

The system should not behave like a generic chatbot.

Instead, agent output is streamed as **blocks** — structured cards that the UI can render consistently:

- easier to scan
- easier to act on
- easier to audit

This is inspired by OpenClaw’s “block streaming” approach (see `https://www.globalbuilders.club/blog/openclaw-codebase-technical-guide`).

---

### 1) Block envelope (common fields)

Every block must include:

```json
{
  "type": "BlockType",
  "id": "blk_...",
  "ts": "2026-02-17T03:15:00Z",
  "severity": "info",
  "title": "Human readable title",
  "data": {},
  "actions": []
}
```

#### 1.1 Fields

- `type` (string): discriminated union
- `id` (string): unique within a run (stable)
- `ts` (ISO string)
- `severity`: `debug | info | warn | error | critical`
- `title` (string)
- `data` (object): type-specific payload
- `actions` (array): UI actions the user can click

#### 1.2 Action shape

```json
{ "id": "approve", "label": "Approve", "style": "primary" }
```
Rules:

- action `id` is sent back to the gateway when clicked
- action handlers must be deterministic or explicitly start an agent run

---

### 2) Streaming contract (how blocks arrive)

Blocks are delivered via gateway events:

- `event.agent.block`

The event payload includes:

- `agentId`
- `runId`
- `block`

Clients should:

- append blocks to the run timeline
- render each block type via a dedicated component
- gracefully fallback for unknown block types (“raw JSON” viewer)

---

### 3) Core block types (MVP)

#### 3.1 `Markdown`
Use for concise explanation or notes.

`data`:

```json
{ "markdown": "Text with **bold** and lists." }
```

#### 3.2 `SystemStatus`
Use for subsystem updates:

- connector connected/disconnected
- indexing status
- budgets exceeded

`data`:

```json
{
  "component": "connector.metaapi",
  "status": "connected",
  "details": { "accountId": "..." }
}
```

#### 3.3 `TradeProposal`
Use when the agent wants approval (or when autopilot is disabled).

`data`:

```json
{
  "symbol": "BTCUSD",
  "timeframe": "5m",
  "side": "buy",
  "orderType": "limit",
  "volume": 0.01,
  "entry": 100000,
  "stopLoss": 99500,
  "takeProfit": 101200,
  "rationale": "Two green candles + support retest",
  "risk": {
    "riskReward": 2.1,
    "marginRequired": 123.45
  },
  "constraints": {
    "maxDailyLossRemaining": 50
  }
}
```

Recommended actions:

- Approve
- Reject
- Modify (opens a form)

#### 3.4 `TradeExecution`
Use for executed outcomes (or failures).

`data`:

```json
{
  "intentId": "intent_...",
  "result": "executed",
  "brokerOrderId": "123456",
  "symbol": "BTCUSD",
  "side": "buy",
  "volume": 0.01,
  "entry": 100000,
  "stopLoss": 99500,
  "takeProfit": 101200,
  "timingMs": 850
}
```

`result` values:

- `executed`
- `rejected`
- `failed`

#### 3.5 `RiskAlert`
Use when risk engine blocks something.

`data`:

```json
{
  "blockedAction": "PLACE_LIMIT_ORDER",
  "violations": [
    { "code": "MAX_DAILY_LOSS", "message": "Daily loss exceeded", "details": {} }
  ]
}
```

#### 3.6 `BacktestReport`
Use after backtests.

`data`:

```json
{
  "symbol": "BTCUSD",
  "timeframe": "5m",
  "startTime": "2025-11-01T00:00:00Z",
  "endTime": "2026-02-01T00:00:00Z",
  "metrics": {
    "totalReturnPct": 12.3,
    "maxDrawdownPct": 4.5,
    "winRatePct": 46.2,
    "profitFactor": 1.31,
    "trades": 120
  },
  "equityCurve": [
    { "ts": "2025-11-01T00:00:00Z", "equity": 1000.0 }
  ],
  "artifactRef": "art_backtest_..."
}
```

Actions:

- Open full report
- Compare with another report

---

### 4) Secondary block types (planned)

- `ChartAnnotation` (levels/zones/notes rendered on chart)
- `ArtifactCreated` (hook/strategy created with path + diff preview)
- `HookEvaluationSummary` (wake hook fired; includes reason)
- `DecisionTrace` (structured chain-of-thought substitute; safe and concise)

---

### 5) UI rendering rules

- Blocks must be readable within 5–10 seconds.
- Prefer tables and bullets to prose.
- TradeProposal blocks must show:
  - entry/SL/TP
  - risk-reward
  - reason
  - approval actions
- RiskAlert blocks must show:
  - which constraint triggered
  - what would satisfy it

Unknown block types:

- render title + raw JSON in a collapsible panel.

---

### 6) Safety

Blocks are UI content and must be treated as untrusted.

Do not allow:

- arbitrary HTML injection
- arbitrary script execution

Render markdown with a safe renderer.
