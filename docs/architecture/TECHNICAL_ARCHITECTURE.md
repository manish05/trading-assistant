## Technical architecture (OpenClaw-inspired, trading-adapted)

This document turns the conceptual architecture into an implementation-ready shape, explicitly borrowing patterns from the **OpenClaw codebase** (agents, tools, skills, plugins, queues, memory, gateway).

Key OpenClaw code references used while writing this:

- **Gateway + protocol**: `openclaw/src/gateway/server/ws-connection.ts`, `openclaw/src/gateway/server/ws-connection/message-handler.ts`, `openclaw/src/gateway/protocol/schema/frames.ts`
- **Tools interface + helpers**: `openclaw/src/agents/tools/common.ts`, `openclaw/src/agents/tools/memory-tool.ts`
- **Tool policy pipeline**: `openclaw/src/agents/tool-policy.ts`, `openclaw/src/agents/tool-policy-pipeline.ts`, `openclaw/src/agents/pi-tools.policy.ts`
- **System prompt builder**: `openclaw/src/agents/system-prompt.ts`
- **Skills (load + prompt injection)**: `openclaw/src/agents/skills/workspace.ts`, `openclaw/src/agents/skills/types.ts`, `openclaw/src/shared/frontmatter.ts`, example `openclaw/skills/*/SKILL.md`
- **Plugins (loader + API + hooks)**: `openclaw/src/plugins/loader.ts`, `openclaw/src/plugins/types.ts`, OpenClaw SDK/runtime refactor plan: `openclaw/docs/refactor/plugin-sdk.md`
- **Queues**: `openclaw/src/auto-reply/reply/queue/types.ts`
- **Hybrid memory**: `openclaw/src/memory/hybrid.ts`, `openclaw/src/memory/sqlite-vec.ts`

---

### 1) Implementation baseline (languages + runtime)

We mirror OpenClaw’s “gateway-first” approach but adapt it for trading.

- **Core gateway + agent runtime**: TypeScript (ESM), Node.js **22+**
  - Rationale: OpenClaw patterns + Node 22 gives us `node:sqlite` (used by OpenClaw) for local-first state/memory.
- **Hook runtime (Wake/AutoTrade/CopyTrade hooks)**: Python (sandboxed)
  - Rationale: indicator math + strategy iteration are most ergonomic in Python; keep deterministic and auditable.
- **Package manager**: **Bun** for JS/TS dependencies and scripts (project rule).
  - Runtime is still Node for the gateway (Bun does not guarantee support for Node built-ins like `node:sqlite`).

---

### 2) Monorepo layout (mirrors OpenClaw: `apps/`, `extensions/`, `skills/`)

Proposed repo shape:

- `src/` (gateway core)
  - `src/gateway/` (WS/HTTP servers, auth, protocol dispatch)
  - `src/protocol/` (TypeBox schemas + Ajv validators; generated types)
  - `src/plugins/` (plugin loader, registry, hook runner)
  - `src/agents/` (agent runner, tool policy, system prompt builder)
  - `src/feeds/` (event bus, subscriptions, replay)
  - `src/hooks/` (hook registry + Python runtime bridge)
  - `src/risk/` (RiskEngine, emergency stop, invariants)
  - `src/memory/` (SQLite FTS + vector hybrid, citations, slot system)
  - `src/storage/` (state dir, audit log, artifacts)
- `apps/`
  - `apps/web/` (dashboard: React)
  - `apps/ios/` (future native client)
  - `apps/android/` (future native client)
- `extensions/` (plugins; OpenClaw-style)
  - `extensions/connector-metaapi-mcp/`
  - `extensions/feed-marketplace/`
  - `extensions/channel-notifications-push/`
  - `extensions/memory-hybrid/` (optional: separate memory backend)
- `skills/` (strategy packs + reusable “how-to” skills)
  - `skills/strategies/<strategy>/SKILL.md` (+ `hooks/`, `references/`, `assets/`)
- `docs/` (this documentation)

Design rule (OpenClaw-refactor-inspired): **extensions must not import core internals** directly. They depend on:

- a stable **plugin SDK** (types + helpers)
- an injected **plugin runtime** (capabilities provided by core)

This is exactly the separation described in OpenClaw’s plan: `openclaw/docs/refactor/plugin-sdk.md`.

---

### 3) Gateway (single mission-control server)

#### 3.1 Transport + libraries (OpenClaw-aligned)

- **WebSocket server**: `ws`
  - OpenClaw uses `ws` (`openclaw/package.json`) and a connection handler with handshake state (`openclaw/src/gateway/server/ws-connection.ts`).
- **HTTP server** (health, static, downloads): `express`
  - OpenClaw uses `express` v5 (`openclaw/package.json`).

#### 3.2 Protocol + validation

We adopt OpenClaw’s pattern:

- Define protocol schemas with **TypeBox** (`@sinclair/typebox`)
- Validate frames/params with **Ajv** (`ajv`)

OpenClaw’s protocol layer compiles validators like `validateConnectParams`, `validateRequestFrame` (`openclaw/src/gateway/protocol/index.ts`) and validates handshake frames in the WS message handler (`openclaw/src/gateway/server/ws-connection/message-handler.ts`).

In v2, we apply the same approach:

- **Every inbound frame** (request/response/event) is schema-validated.
- **Every public method** validates params and returns typed errors.
- **Every trading action** is deterministic + audited.

#### 3.3 Mobile clients (first-class) and pairing

OpenClaw distinguishes “user” vs “node” clients and supports mobile nodes (`openclaw/src/gateway/server-mobile-nodes.ts`).

We copy the concept:

- Web dashboard is a **user client**
- Mobile apps are **paired devices** (node-like)
  - used for push notifications
  - used for secure approvals (future)

We keep the gateway protocol stable so future clients are “just another client” over the same WS JSON-RPC.

---

### 4) Agents, tools, and tool policy (OpenClaw-style)

#### 4.1 Tool interface (shared contract)

OpenClaw tools follow a consistent interface (see `openclaw/src/agents/tools/memory-tool.ts`):

- `label` (human-friendly)
- `name` (stable identifier)
- `description`
- `parameters` (TypeBox schema)
- `execute(toolCallId, params)` returns a structured tool result

We use the same structure for:

- **trading tools** (place/modify/cancel)
- **market data tools** (candles, snapshots)
- **agent orchestration tools** (subagents)
- **memory tools** (search + get)

Tool parameter parsing helpers are borrowed conceptually from OpenClaw’s `readStringParam`, `readNumberParam`, `jsonResult` (`openclaw/src/agents/tools/common.ts`).

#### 4.2 Tool policy pipeline (deny-by-default where it matters)

OpenClaw resolves tool permissions via a **policy pipeline**:

- profile policy
- provider profile policy
- global allow/deny
- per-agent allow/deny
- per-group allow/deny
- sandbox/subagent constraints

See: `openclaw/src/agents/tool-policy.ts` and `openclaw/src/agents/tool-policy-pipeline.ts`.

We adopt the same pipeline, but with trading-first profiles:

- `minimal`: read-only status, logs, memory
- `observe`: market data + analysis, no execution
- `paper`: can simulate intents, no live execution tools
- `trade-demo`: demo execution tools
- `trade-live`: live execution tools (optionally approval-gated)

Hard rule (trading safety): **execution tools are never available unless explicitly allowed by mode + policy**.

#### 4.3 Subagents

OpenClaw exposes subagent orchestration as a tool (`openclaw/src/agents/tools/subagents-tool.ts`) with:

- `list` / `kill` / `steer`
- rate limiting
- cascade-kill of descendant runs

We keep the same operational idea for trading:

- subagents can research, backtest, or draft hooks
- the parent agent remains accountable and must journal decisions
- leaf subagents have stricter tool denies (no execution tools)

---

### 5) System prompt + skills (progressive disclosure)

#### 5.1 System prompt builder

OpenClaw dynamically builds the system prompt from:

- enabled tools list
- safety rules
- skills instructions
- memory recall instructions
- runtime info
- injected workspace files (including `SOUL.md`)

See: `openclaw/src/agents/system-prompt.ts`.

We adopt the same concept:

- A deterministic “prompt builder” assembles:
  - **hard trading safety** constraints
  - enabled tools (after policy)
  - agent workspace docs (`SOUL.md`, `TRADING_MANUAL.md`)
  - memory citations (if enabled)
  - current run context (trigger + snapshots)

#### 5.2 Skills system (strategy packs and operational playbooks)

OpenClaw skills are directories with a `SKILL.md` containing YAML frontmatter (`name`, `description`) and optional JSON5 metadata blocks (`openclaw/src/agents/skills/workspace.ts`, `openclaw/src/shared/frontmatter.ts`).

We keep this exact pattern and extend it for trading:

- **Strategy packs** (marketplace-installable)
  - `hooks/` (wake/autotrade/copytrade scripts)
  - `references/` (assumptions, math, risks)
  - `assets/` (optional UI templates / report layouts)
- **Connector playbooks** (how to configure a broker)
- **Risk policy templates**

Security note: OpenClaw includes a skill scanner for risky JS/TS patterns (`openclaw/src/security/skill-scanner.ts`). For v2, we add:

- scanning for **Python** risk patterns too (subprocess, networking, env harvesting)
- explicit sandbox constraints for hook execution

---

### 6) Plugins (extensions) (OpenClaw loader + API model)

OpenClaw loads plugins using a TS-friendly loader (`jiti`) and a registry (`openclaw/src/plugins/loader.ts`) and exposes a rich plugin API (`openclaw/src/plugins/types.ts`) including:

- `registerTool`
- `registerHook`
- `registerGatewayMethod`
- `registerService`
- `registerCommand` (deterministic, bypass LLM)

We copy the pattern:

- **Connector plugins** register:
  - market data feeds
  - broker execution functions
  - deterministic commands (e.g., “sync account”, “reconnect”)
- **Marketplace plugin** registers:
  - `copytrade.signal.*` feed(s)
  - optional gateway methods for browsing/following
- **Notifications plugin** registers:
  - push delivery service
  - deterministic “send test notification”

We also copy OpenClaw’s **plugin hook lifecycle** idea (from `openclaw/src/plugins/types.ts`):

- `before_agent_start`, `llm_input`, `llm_output`, `after_tool_call`, `tool_result_persist`, etc.

In trading, these hooks are perfect for:

- audit logging
- redaction
- compliance/limits enforcement
- telemetry and cost accounting

---

### 7) Memory (local-first, hybrid retrieval)

We follow OpenClaw’s “local-first hybrid memory” direction:

- SQLite FTS (keyword recall)
- Vector search (semantic recall)
- Merge results deterministically

OpenClaw’s hybrid merge is implemented in `openclaw/src/memory/hybrid.ts`.

For vectors we reuse OpenClaw’s approach of **sqlite-vec** loaded into Node’s built-in SQLite:

- `openclaw/src/memory/sqlite-vec.ts` loads `sqlite-vec` into `node:sqlite`’s `DatabaseSync`

This keeps memory self-contained, deployable, and auditable.

---

### 8) Copy-trading marketplace (in scope, post-MVP)

We keep copy-trading fully compatible with the core architecture:

- **Signals are feeds**: marketplace emits `copytrade.signal.*` events
- **Execution is deterministic**: a CopyTrade Hook maps signals → `TradeIntent`
- **RiskEngine always gates**: follower constraints always win
- **Audit-first**: every signal → decision → execution/rejection is logged and replayable

This matches the “feeds → hooks → intents → risk → execute” pipeline already defined in `docs/architecture/FEEDS_AND_HOOKS.md`.

---

### 9) Common library set (recommended)

This list is intentionally biased toward OpenClaw’s proven choices.

#### 9.1 Gateway / protocol
- `ws` (WebSocket server)
- `express` (HTTP endpoints)
- `@sinclair/typebox` + `ajv` (schemas + validation)
- `undici` (HTTP client)

#### 9.2 Config + reload
- `json5` (human-friendly config)
- `zod` (config validation ergonomics)
- `chokidar` (watch config/workspace artifacts)

#### 9.3 Plugins
- `jiti` (TS-first runtime loader for plugins)

#### 9.4 Scheduling / time
- `croner` (cron jobs / schedules)

#### 9.5 Storage / memory
- Node **built-in** `node:sqlite` (local DB)
- `sqlite-vec` (vector extension)

#### 9.6 Logging / safety
- `tslog` (structured logging)
- `dotenv` (dev env loading)

#### 9.7 Web dashboard
- `react`, `vite`, `typescript`
- `tailwindcss`
- `tradingview/lightweight-charts` (candles + overlays)

#### 9.8 Hook runtime (Python)
- `pytest` (tests)
- `pydantic` (validation of hook outputs/intent schemas)
- optional: `numpy`, `pandas` (indicator math), only if needed

