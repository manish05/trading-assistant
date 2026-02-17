## Gateway protocol (WebSocket JSON-RPC)

This doc defines the **public protocol** between clients (web UI, CLI, chat channels) and the gateway.

We take strong inspiration from OpenClaw’s gateway design:

- JSON-RPC-like method dispatch over WebSocket
- event streaming
- a single “mission control” server

Reference: `https://www.globalbuilders.club/blog/openclaw-codebase-technical-guide`.

---

### 1) Transport

- **Primary**: WebSocket
- **Protocol**: JSON messages
- **Message classes**:
  - request
  - response
  - event

HTTP is used for:

- health endpoint
- static frontend assets (optional)
- file downloads (backtest reports) (optional)

---

### 2) Message envelope

We use a stable envelope so clients can implement one parser.

#### 2.1 Request frame

```json
{
  "type": "req",
  "id": "req_123",
  "method": "agent.run",
  "params": { }
}
```

Rules:

- `id` must be unique per connection.
- `method` is a dot-separated namespace.
- `params` must be an object (never null).

#### 2.2 Response frame

```json
{
  "type": "res",
  "id": "req_123",
  "ok": true,
  "payload": { }
}
```

On error:

```json
{
  "type": "res",
  "id": "req_123",
  "ok": false,
  "error": {
    "code": "AUTH_REQUIRED",
    "message": "Not authenticated",
    "retryable": false,
    "details": { }
  }
}
```

#### 2.3 Event frame

```json
{
  "type": "event",
  "event": "agent.block",
  "payload": { }
}
```

Events are **server → client**.

Events are best-effort on the wire but **must** be persisted when critical (trades, risk stops) so clients can re-fetch.

---

### 3) Connection handshake

The first client request **must** be `gateway.connect`.

#### 3.1 `gateway.connect` (MVP)

Request:

```json
{
  "type": "req",
  "id": "req_connect",
  "method": "gateway.connect",
  "params": {
    "client": {
      "name": "web",
      "kind": "web",
      "platform": "browser",
      "version": "0.1.0",
      "deviceId": "optional-stable-device-id"
    },
    "protocol": {
      "min": 1,
      "max": 1
    },
    "auth": {
      "mode": "token",
      "token": "gw_..."
    }
  }
}
```

Client notes:

- `client.kind` is future-proofing for multiple clients: `web` / `mobile` / `cli` / `channel` / `service`.
- `client.platform` helps telemetry and capability negotiation (e.g., `browser`, `ios`, `android`).
- Mobile pairing + push tokens should be handled by explicit methods (e.g., `devices.pair`, `devices.registerPush`) rather than overloading `gateway.connect`.

Response payload:

```json
{
  "protocol": { "selected": 1 },
  "session": { "sessionId": "sess_abc", "role": "operator" },
  "server": { "name": "mt5-claude-trader-v2", "version": "0.1.0" }
}
```

Notes:

- For MVP we support only `token` auth.
- Later we can add password, device pairing, and Tailscale identity (OpenClaw patterns).

---

### 4) Authentication and roles

#### 4.1 Roles

- `operator`: full control (create agents, connect accounts, execute trades)
- `viewer`: read-only dashboard
- `agent`: internal role used for subagent processes (future)

#### 4.2 Auth modes (roadmap)

- **Token (MVP)**: single shared secret
- **Password**: username/password pairs (stored hashed)
- **Device token + pairing**: inspired by OpenClaw’s node pairing
- **Tailscale identity**: for local networks / multi-instance ops

---

### 5) Method namespaces

We group methods by domain. Each method should be:

- idempotent where possible
- deterministic if it performs trading operations
- fully logged if it touches risk or execution

#### 5.1 `gateway.*`

- `gateway.ping` → `{ now }`
- `gateway.status` → health + uptime + subsystem status

#### 5.2 `config.*`

- `config.get` → returns effective config
- `config.patch` → apply patch (validated)
- `config.schema` → (optional) return JSON schema for UI forms

#### 5.3 `accounts.*`

- `accounts.list`
- `accounts.connect`
- `accounts.disconnect`
- `accounts.status`
- `accounts.get`

#### 5.4 `feeds.*`

- `feeds.list`
- `feeds.subscribe` (client wants live events)
- `feeds.unsubscribe`
- `feeds.getCandles` (snapshot fetch)

#### 5.5 `agents.*`

- `agents.list`
- `agents.create`
- `agents.update`
- `agents.pause`
- `agents.resume`
- `agents.getWorkspace` (paths + files)

#### 5.6 `agent.*` (runs)

- `agent.run` (enqueue a run request)
- `agent.abort` (abort active run)
- `agent.wait` (wait for run completion)
- `agent.queue.status`

#### 5.7 `trades.*`

- `trades.place` (deterministic order placement request)
- `trades.modify`
- `trades.cancel`
- `trades.closePosition`

These methods **must** call risk checks and write audit entries.

#### 5.8 `risk.*`

- `risk.preview` (dry-run risk check)
- `risk.emergencyStop` (pause + cancel/close actions)
- `risk.status`

#### 5.9 `memory.*`

- `memory.search` (returns citations)
- `memory.status` (index health)

#### 5.10 `backtests.*`

- `backtests.run`
- `backtests.get`
- `backtests.list`

#### 5.11 `marketplace.*` (copy-trading + strategy packs)

- `marketplace.list` (strategies/traders)
- `marketplace.get` (detail + metrics)
- `marketplace.follow`
- `marketplace.unfollow`
- `marketplace.myFollows`

#### 5.12 `copytrade.*` (follower execution control)

- `copytrade.status` (per follow)
- `copytrade.pause` / `copytrade.resume`
- `copytrade.preview` (show leader→follower mapping + projected risk check)

#### 5.13 `devices.*` (mobile pairing + push)

- `devices.list`
- `devices.pair` / `devices.unpair`
- `devices.registerPush` (store push token)
- `devices.notifyTest`

---

### 6) Event stream

Events are how the UI stays live without polling.

#### 6.1 Core events (MVP)

- `event.gateway.status`
- `event.account.status`
- `event.feed.event`
- `event.hook.evaluated`
- `event.agent.run.started`
- `event.agent.block`
- `event.agent.run.completed`
- `event.trade.intent`
- `event.trade.executed`
- `event.trade.rejected`
- `event.risk.alert`
- `event.emergency_stop`
- `event.copytrade.signal` (leader signal received)
- `event.copytrade.execution` (follower execution outcome)
- `event.device.paired`
- `event.notification.sent`

#### 6.2 Block streaming

Agent output is streamed as **blocks** (cards) rather than plain text.

Block format is specified in `docs/specs/BLOCKS_SPEC.md`.

A typical stream:

- run started
- N blocks
- run completed

---

### 7) Errors

Error shape:

```json
{
  "code": "STRING_ENUM",
  "message": "Human readable summary",
  "retryable": false,
  "details": {}
}
```

#### 7.1 Suggested error codes

- `AUTH_REQUIRED`
- `AUTH_INVALID`
- `AUTH_FORBIDDEN`
- `INVALID_PARAMS`
- `NOT_FOUND`
- `CONFLICT`
- `RATE_LIMITED`
- `CONNECTOR_UNAVAILABLE`
- `CONNECTOR_ERROR`
- `RISK_BLOCKED`
- `MARKET_CLOSED`
- `TIMEOUT`
- `INTERNAL_ERROR`

#### 7.2 Risk-blocked as a first-class error

If an operation is blocked by risk constraints, the server should:

- return a response with `ok=false` and `code=RISK_BLOCKED`
- emit `event.risk.alert` with a detailed explanation
- log an audit entry

---

### 8) Versioning

- Protocol version is negotiated at connect.
- All payloads should be additive-only within a version.
- Breaking changes require protocol bump.

---

### 9) Examples

#### 9.1 Subscribe to feed events

```json
{
  "type": "req",
  "id": "req_sub_1",
  "method": "feeds.subscribe",
  "params": {
    "topics": ["market.candle.closed", "trade.executed"],
    "symbols": ["BTCUSD", "ETHUSD"],
    "timeframes": ["5m", "1h"]
  }
}
```

#### 9.2 Trigger an agent run (manual)

```json
{
  "type": "req",
  "id": "req_run_1",
  "method": "agent.run",
  "params": {
    "agentId": "agent_btc_5m",
    "request": {
      "kind": "user_control",
      "message": "Cancel any pending orders and pause trading for 2 hours."
    }
  }
}
```

#### 9.3 Receive a trade proposal block

```json
{
  "type": "event",
  "event": "event.agent.block",
  "payload": {
    "agentId": "agent_btc_5m",
    "runId": "run_123",
    "block": {
      "type": "TradeProposal",
      "id": "blk_001",
      "ts": "2026-02-17T02:55:00Z",
      "title": "BTCUSD 5m: momentum continuation",
      "data": {
        "symbol": "BTCUSD",
        "side": "buy",
        "entry": 100000,
        "stopLoss": 99500,
        "takeProfit": 101200
      },
      "actions": [
        { "id": "approve", "label": "Approve" },
        { "id": "reject", "label": "Reject" }
      ]
    }
  }
}
```

