## MetaAPI connector (via MCP server)

### 0) Scope

This doc specifies how v2 will integrate with MT5 via **MetaAPI Cloud**, using the reference MCP server:

- Reference repo: `metatrade-metaapi-mcp-server` (run separately)

Why this matters:

- it defines the **contract** we rely on for trading and market data
- it’s the first “real connector” that proves the plugin architecture

We treat the MCP server as an external plugin (`entry.type = external.mcp`).

---

### 1) Reference server behaviors (important details)

From the reference MCP server:

- Transport: **SSE** (server-sent events) for MCP client connection
- Auth:
  - token from server env (`METAAPI_TOKEN` / `TOKEN`)
  - or a per-session token via `?token=` query
  - optional `?accounts=` to restrict allowed accounts
- Connection caching:
  - caches MetaAPI client per session
  - caches RPC connection per `sessionId-accountId`
  - auto-deploys account if needed and waits for synchronization
- Error mapping:
  - converts MetaAPI errors into typed codes like `MARKET_CLOSED`, `TRADE_CONTEXT_BUSY`, `INSUFFICIENT_FUNDS`, `INVALID_STOPS`

This is exactly the kind of “connector isolation” we want.

---

### 2) Tool surface (what the gateway can call)

The reference server exposes these key tool groups:

#### 2.1 Market data tools
- `get_symbols({ accountId })`
- `get_symbol_price({ accountId, symbol })`
- `get_symbol_specification({ accountId, symbol })`
- `get_candles({ accountId, symbol, timeframe, startTime?, limit? })`
- `get_ticks({ accountId, symbol, startTime?, offset?, limit? })` (MT5 only)
- `subscribe_price({ accountId, symbol })` (streaming)
- `get_server_time({ accountId })`

Supported `timeframe` values:

- `1m | 5m | 15m | 30m | 1h | 4h | 1d | 1w | 1mn`

#### 2.2 Trading tools
- `place_market_order({ accountId, symbol, side, volume, stopLoss?, takeProfit?, comment? })`
- `place_limit_order({ accountId, symbol, side, volume, openPrice, stopLoss?, takeProfit?, comment? })`
- `create_stop_buy_order({ accountId, symbol, volume, openPrice, stopLoss?, takeProfit?, comment? })`
- `create_stop_sell_order({ accountId, symbol, volume, openPrice, stopLoss?, takeProfit?, comment? })`
- `create_market_order_with_trailing_sl({ ... })`
- `close_position({ accountId, positionId })`
- `modify_position({ accountId, positionId, stopLoss?, takeProfit? })`
- `cancel_order({ accountId, orderId })`
- `modify_order({ accountId, orderId, openPrice, stopLoss?, takeProfit? })`

#### 2.3 Queries (positions/orders/history)
- `get_positions({ accountId })`, `get_position({ accountId, positionId })`
- `get_orders({ accountId })`, `get_order({ accountId, orderId })`
- `get_history_orders({ accountId, startTime?, endTime? })`
- `get_deals({ accountId, startTime?, endTime? })`

#### 2.4 Account lifecycle
- `list_accounts()`
- `get_account_state({ accountId })`
- `get_account_information({ accountId })`
- `deploy_account({ accountId })`
- `undeploy_account({ accountId })`
- `redeploy_account({ accountId })`
- `get_terminal_state({ accountId })`

---

### 3) The v2 unified connector interface

Even though MetaAPI exposes many tools, the gateway should depend on a **small stable interface**.

We use capabilities to avoid “lowest common denominator” design.

Proposed conceptual interface:

```text
BrokerConnector
  - id: string
  - kind: "metaapi"
  - capabilities: ConnectorCapabilities

  - health(): ConnectorHealth

  - getAccountInfo(accountId): AccountInfo
  - getPositions(accountId): Position[]
  - getOrders(accountId): Order[]

  - getCandles(accountId, symbol, timeframe, startTime?, limit?): Candle[]
  - getPrice(accountId, symbol): PriceQuote

  - placeOrder(accountId, OrderIntent): OrderResult
  - modifyOrder(accountId, ModifyOrderIntent): OrderResult
  - cancelOrder(accountId, orderId): OrderResult
  - closePosition(accountId, positionId): OrderResult
```

MetaAPI MCP tools map cleanly to this.

---

### 4) Mapping table (MetaAPI MCP → v2 operations)

| v2 operation | MetaAPI MCP tool |
|---|---|
| getCandles | `get_candles` |
| getPrice | `get_symbol_price` |
| place market order | `place_market_order` |
| place limit order | `place_limit_order` |
| place stop order | `create_stop_buy_order` / `create_stop_sell_order` |
| trailing stop | `create_market_order_with_trailing_sl` |
| cancel order | `cancel_order` |
| modify order | `modify_order` |
| close position | `close_position` |
| modify position SL/TP | `modify_position` |
| list positions | `get_positions` |
| list orders | `get_orders` |
| account info | `get_account_information` |

---

### 5) Streaming and feed integration

We need two market-data behaviors:

- **snapshot fetch** (candles for chart/backtest)
- **event feed** (wake hooks)

Strategy:

- use `get_candles` on a schedule to produce `market.candle.closed` events
- optionally use `subscribe_price` to produce `market.price.tick` events

The gateway should normalize all events into `FeedEvent` envelopes (see `docs/architecture/FEEDS_AND_HOOKS.md`).

Important:

- candle-close detection must be robust (timezone, server time)
- avoid double-emitting the same candle close (dedupe by `(symbol,timeframe,closeTime)`)

---

### 6) Idempotency

Broker execution must be idempotent when possible.

MetaAPI supports client-side order identifiers and comments with length constraints.

Policy:

- gateway generates a stable `clientOrderId` (short)
- gateway stores mapping from `TradeIntent.intentId → clientOrderId`
- on retries, resend the same `clientOrderId`
- connector wrapper detects duplicates and surfaces them

---

### 7) Error handling contract

The gateway must translate connector failures into:

- protocol errors (for deterministic calls)
- blocks + events (for UI)
- audit entries (always)

Examples:

- `MARKET_CLOSED` → `RiskAlert` block + `ok=false` with `code=MARKET_CLOSED`
- `TRADE_CONTEXT_BUSY` → retryable connector error with backoff
- `INSUFFICIENT_FUNDS` → risk blocked / execution blocked depending on context

The connector wrapper should preserve:

- `retryable` hint
- original provider error text (redacted)
- structured details if available

---

### 8) Testing strategy (TDD + contract tests)

We will follow strict TDD (see `docs/dev/TDD.md`).

For connectors:

- **Unit tests** for mapping and error translation
- **Contract tests** against a running MCP server
  - mirror the reference server’s integration test style
  - mark tests as “live” because they require credentials

We explicitly avoid the testing anti-pattern of “testing mock behavior”:

- prefer testing real connector wrapper behavior
- only mock the network transport at the lowest possible layer

Reference anti-patterns doc:

- `https://raw.githubusercontent.com/obra/superpowers/refs/heads/main/skills/test-driven-development/testing-anti-patterns.md`

