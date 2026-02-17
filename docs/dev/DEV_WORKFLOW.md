## Dev workflow (local-first)

### 0) Tooling requirements

- **Node.js**: 22+ (gateway runtime; for `node:sqlite`)
- **Python**: 3.12+
- **bun**: package manager + frontend tooling
- **Docker**: optional (for running connector services)

We prefer bun over npm everywhere we can.

---

### 1) Secrets and environment files

- `.env` is always git-ignored (see `.gitignore`).
- Do not paste secrets into docs.

Reference v1 env keys (do not commit):

- v1 `.env.example` (from the v1 `mt5-claude-trader` repo you referenced)

MetaAPI MCP server env key:

- `METAAPI_TOKEN` (see the MetaAPI MCP server repo’s `.env.example`)

When we scaffold code, we will add:

- `.env.example` (sanitized)
- `.env` (copied from v1 only if you explicitly want it here)

---

### 2) Running connector services (MetaAPI MCP)

Reference server:

- `metatrade-metaapi-mcp-server` (run separately)

Typical steps:

- `bun install`
- set `METAAPI_TOKEN` in that repo’s `.env`
- `bun run start` (or `node src/index.js`)

Gateway will connect to its SSE endpoint.

See connector contract doc:

- `docs/architecture/CONNECTORS_METAAPI_MCP.md`

---

### 3) Development cadence (docs-first + TDD)

Rules:

- update docs before implementing a subsystem
- implement via strict TDD (see `docs/dev/TDD.md`)
- keep modules small and composable

Recommended iteration loop:

- pick one thin slice (e.g., “emit `market.candle.closed` events”)
- write failing tests
- implement minimal code
- refactor
- update docs if reality diverged

---

### 4) Conventions (naming, structure)

#### 4.1 Naming
- IDs are snake-ish with prefixes: `agent_`, `run_`, `evt_`, `trade_`
- Topics are dot-delimited: `market.candle.closed`

#### 4.2 Files
- agent workspaces live in `agents/`
- deterministic hooks live in `agents/<agentId>/hooks/`
- UI blocks contract lives in `docs/specs/BLOCKS_SPEC.md`

#### 4.3 “Hard constraints” vs “soft instructions”
- hard constraints are config + code (RiskEngine)
- soft preferences are natural language in `TRADING_MANUAL.md`

This keeps the system safe and understandable.

---

### 5) Testing layers

Planned test categories:

- backend unit tests (fast, deterministic)
- backend integration tests (live connector credentials)
- frontend component tests
- contract tests (gateway ↔ connector)

A change is not “done” until tests exist and were seen failing first.

