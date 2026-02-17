## Configuration spec (gateway, plugins, agents)

### 0) Why a config spec exists

Trading systems fail in “unknown unknown” ways if config is implicit.

We want config that is:

- readable and explicit
- validated (schema)
- safe (secrets redacted; risky defaults avoided)
- reloadable where safe (hot reload), restart-required where not

OpenClaw uses JSON5 + schema validation + hot reload patterns; we borrow the mindset.

Reference: `https://www.globalbuilders.club/blog/openclaw-codebase-technical-guide`.

---

### 1) Format

Recommended format: **JSON5** (comments, trailing commas).

Config file name (proposed):

- `config/config.json5`

Environment interpolation (proposed):

- allow `${ENV_VAR}` in values
- resolve at load time

---

### 2) Top-level structure (proposed)

```json5
{
  gateway: {
    host: "0.0.0.0",
    port: 18789,
    auth: {
      mode: "token",
      token: "${GATEWAY_TOKEN}",
    },
  },

  plugins: {
    allow: ["metaapi-mcp"],
    deny: [],
    slots: {
      memory: "sqlite_fts",
    },
    instances: [
      {
        id: "metaapi-mcp",
        kind: "external.mcp",
        url: "http://localhost:3000/sse",
        token: "${METAAPI_TOKEN}",
        allowedAccounts: ["YOUR_METAAPI_ACCOUNT_ID"],
      },
    ],
  },

  accounts: [
    {
      accountId: "acct_demo_1",
      connectorId: "metaapi-mcp",
      providerAccountId: "YOUR_METAAPI_ACCOUNT_ID",
      mode: "demo",
      label: "My Demo MT5",
      allowedSymbols: ["ETHUSDm", "BTCUSDm"],
    },
  ],

  agents: [
    {
      agentId: "agent_eth_5m",
      name: "ETH 5m trader",
      workspacePath: "agents/agent_eth_5m",
      executionMode: "demo",
      allowedAccounts: ["acct_demo_1"],
      allowedSymbols: ["ETHUSDm"],
      allowedTimeframes: ["5m", "1h"],
      queue: { mode: "steer-backlog", cap: 50, dropPolicy: "old", dedupe: "dedupeKey" },
      budgets: { maxRunsPerHour: 12, cooldownSecondsAfterNoTrade: 120 },
      risk: {
        maxTradesPerDay: 10,
        maxConcurrentPositions: 1,
        maxDailyLoss: 50,
        requireStopLoss: true,
      },
    },
  ],

  feeds: {
    candles: {
      enabled: true,
      pollSecondsByTimeframe: { "5m": 45, "1h": 180 },
    },
    priceTicks: { enabled: false },
  },

  storage: {
    dataDir: "data",
    retentionDays: 30,
  },

  logging: {
    level: "info",
    redactSecrets: true,
  },
}
```

This spec is intentionally verbose so the system is understandable.

---

### 3) Validation and defaults

Rules:

- config must be validated before the gateway starts
- invalid config must fail fast with clear errors
- defaults must be safe (paper/demo first)

---

### 4) Hot reload vs restart

Not every change should hot reload.

Suggested categories:

- **hot reload**: feed polling intervals, UI subscriptions, budgets
- **restart required**: gateway port, auth mode, plugin instance URLs
- **blocked**: switching to live mode without explicit confirmation flow

---

### 5) Secrets

Secrets must not be:

- printed in logs
- returned by API
- stored in plain-text artifacts

Preferred:

- secrets live in `.env` or OS keychain (future)
- config contains `${ENV_VAR}` references

