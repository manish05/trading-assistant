## Domain model (core types and invariants)

### 0) Purpose

This document defines the **stable vocabulary** of the system.

If we keep these types crisp:

- plugins remain swappable
- tests become obvious
- the UI contract becomes reliable

These types are referenced by:

- gateway JSON-RPC protocol (`docs/architecture/GATEWAY_PROTOCOL.md`)
- blocks contract (`docs/specs/BLOCKS_SPEC.md`)
- connectors (`docs/architecture/CONNECTORS_METAAPI_MCP.md`)

---

### 1) Identifier conventions

We use prefixed ids so logs are readable.

Examples:

- `agent_btc_5m`
- `acct_metaapi_demo_01`
- `run_20260217_000123`
- `evt_...`
- `intent_...`
- `trade_...`
- `blk_...`

Rule: ids are treated as opaque strings by clients.

---

### 2) Core entities

#### 2.1 Account

Represents a trading account connected via a connector.

Fields (conceptual):

- `accountId` (string): our internal id
- `connectorId` (string): which connector handles it (e.g., `metaapi-mcp`)
- `providerAccountId` (string): connector’s account id (MetaAPI account id)
- `mode` (`paper | demo | live`)
- `label` (string)
- `allowedSymbols` (string[])
- `status` (connected/syncing/error)
- `createdAt`, `updatedAt`

Invariants:

- `mode=live` requires explicit opt-in.
- An agent can only trade symbols in `allowedSymbols` intersection with its own allowlist.

#### 2.2 ConnectorCapabilities

Capabilities are used to avoid “lowest common denominator” connectors.

- `orderTypes`: `market | limit | stop`
- `supportsTrailingSL` (bool)
- `supportsTicks` (bool)
- `timeframes`: allowed candle timeframes

#### 2.3 Agent

Fields:

- `agentId`
- `name`
- `workspacePath`
- `executionMode` (`paper | demo | live`)
- `allowedAccounts` (accountId[])
- `allowedSymbols` (string[])
- `allowedTimeframes` (string[])
- `queueSettings` (see below)
- `budgets` (max runs/hr etc)
- `riskPolicy` (hard constraints)
- `createdAt`, `updatedAt`

Invariants:

- `executionMode` cannot exceed the account mode (e.g., agent live on demo account is okay, but demo agent on live account must still obey “no live execution” if configured).
- Queue caps must be finite.

#### 2.4 QueueSettings

- `mode`: `followup | interrupt | collect | steer-backlog | queue`
- `cap`: integer
- `dropPolicy`: `old | new | summarize`
- `dedupe`: `none | dedupeKey | messageId`
- `debounceMs` (collect mode only)

Invariants:

- `debounceMs` is required for `collect`.
- `interrupt` is only valid for high-priority requests.

#### 2.5 FeedEvent

See `docs/architecture/FEEDS_AND_HOOKS.md` for the envelope.

Key fields:

- `eventId`
- `ts`
- `source`
- `topic`
- `partitionKey`
- `payload`
- optional: `symbol`, `timeframe`, `accountId`, `sequence`, `traceId`

Invariants:

- `eventId` must be stable for dedupe.
- ordering is guaranteed only within a `partitionKey`.

#### 2.6 HookMetadata

- `hookId`
- `agentId`
- `type`: `wake | autotrade | copytrade`
- `path`: workspace-relative path
- `revision`: monotonically increasing integer or hash
- `subscriptions`: topic filters (topics + symbols + timeframes)

#### 2.7 HookDecision

Wake hooks:

- `decision`: `IGNORE | WAKE | ALERT`
- `reason`
- optional `dedupeKey`, `cooldownSeconds`

AutoTrade hooks:

- `decision`: `IGNORE | TRADE_INTENT | ALERT`
- `reason`
- `intent` (TradeIntent) when `TRADE_INTENT`
- optional `dedupeKey`, `cooldownSeconds`

Invariants:

- `TRADE_INTENT` must include `intent`.

#### 2.8 AgentRequest

- `requestId`
- `agentId`
- `kind`: `user_control | hook_trigger | scheduled_audit | system_alert`
- `priority`: `high | normal | low`
- `createdAt`
- optional `dedupeKey`
- `payload`

Invariants:

- high-priority requests must be executable even if LLM budgets are exceeded (deterministic actions).

#### 2.9 AgentRun

- `runId`
- `agentId`
- `trigger`: reference to AgentRequest / FeedEvent
- `startedAt`, `completedAt`
- `status`: `running | completed | aborted | failed`
- `inputs`: snapshot refs (market/account/memory)
- `blocks`: emitted blocks (see blocks spec)
- `intents`: produced TradeIntent[]
- `riskDecisions`: RiskDecision[]
- `executions`: TradeExecution[]

Invariants:

- Every execution must reference a risk decision.

#### 2.10 TradeIntent

TradeIntent is a desired broker action.

- `intentId`
- `ts`
- `origin`: `agent | autotrade_hook | user`
- `accountId`
- `symbol`
- `action`:
  - `PLACE_MARKET_ORDER`
  - `PLACE_LIMIT_ORDER`
  - `PLACE_STOP_ORDER`
  - `MODIFY_ORDER`
  - `CANCEL_ORDER`
  - `MODIFY_POSITION`
  - `CLOSE_POSITION`
- `params`: action-specific fields (volume, prices, ids, SL/TP)
- `reason`
- optional `clientOrderId` (idempotency)

Invariants:

- any placement action must satisfy order hygiene rules (SL presence etc) or be blocked by RiskEngine.

#### 2.11 RiskDecision

- `allowed` (bool)
- `violations` (array)
- `computed` (optional): margin, RR, etc

Violation:

- `code` (string enum)
- `message`
- `details`

#### 2.12 TradeExecution

- `tradeId`
- `intentId`
- `status`: `executed | rejected | failed`
- `providerIds` (orderId/positionId)
- `timingMs`
- `raw` (redacted provider response)

#### 2.13 BacktestRun

- `backtestId`
- `agentId`
- `strategyRef` (path + revision)
- `datasetHash`
- `config` (symbol, timeframe, time range, assumptions)
- `metrics`
- `artifactRef` (stored report)

#### 2.14 AuditEntry

- `auditId`
- `ts`
- `actor`: `user | agent | hook | system`
- `action` (string)
- `traceId`
- `data` (redacted and structured)

Invariants:

- all money/risk-changing actions generate audit entries.

#### 2.15 MarketplaceStrategy (post-MVP, in scope)

Represents a marketplace item a user can install/follow.

- `strategyId`
- `kind`: `signal_feed | hook_pack | agent_pack`
- `title`, `description`
- `publisher`
- `tags` (e.g., BTC, trend, mean-reversion)
- `performance` (time-windowed metrics, source-of-truth + timestamp)
- `riskNotes` (human-readable disclaimers)
- `version` (semver or revision)

Invariants:

- Strategy metadata is **advisory**; follower RiskEngine constraints always win.

#### 2.16 CopyTradeFollow (post-MVP, in scope)

Represents a follower subscription to a marketplace strategy/trader.

- `followId`
- `strategyId`
- `accountId` (follower account)
- `agentId` (agent responsible for audit/logging, if applicable)
- `status`: `active | paused | stopped`
- `constraints` (hard caps: symbols, direction, sizing, max slippage, concurrency)
- `createdAt`, `updatedAt`

#### 2.17 CopyTradeSignal

Normalized leader signal emitted by marketplace feeds.

- `signalId` (stable for idempotency)
- `strategyId`
- `ts`
- `symbol`, `timeframe`
- `action`: `OPEN | MODIFY | CLOSE`
- `leader` (opaque leader/trader id)
- `payload` (prices, SL/TP, sizing hints, confidence, annotations)

Invariants:

- `signalId` must be stable; follower copy hooks rely on it for idempotency.

#### 2.18 Device (mobile client pairing)

Represents a paired mobile device for notifications and approvals.

- `deviceId`
- `userId`
- `platform`: `ios | android`
- `label` (e.g., “iPhone”)
- `pushToken` (encrypted at rest)
- `pairedAt`, `lastSeenAt`

