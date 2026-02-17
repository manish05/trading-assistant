## Plugin system (connectors, feeds, channels, memory)

### 0) Why plugins

We need to support:

- multiple brokers (MetaAPI/MT5 now, Binance later)
- multiple feeds (candles/ticks now, social/news later)
- multiple “interfaces” (web UI now, Telegram/WhatsApp later)
- potentially multiple memory backends (FTS now, hybrid later)

A plugin system prevents the gateway from becoming a monolith.

OpenClaw reference: it loads plugins from multiple locations, validates manifests and config, and registers tools/hooks/channels in a registry (`https://www.globalbuilders.club/blog/openclaw-codebase-technical-guide`).

---

### 1) Plugin kinds (v2)

We treat plugins as **capability providers**. A plugin declares one or more of these kinds:

- **connector.broker**: trade operations + account state
- **connector.marketData**: candles/prices/ticks
- **feed.external**: social/news/sentiment events
- **feed.marketplace**: strategy listings + copy-trading signal feeds (post-MVP, in scope)
- **channel.ui**: WhatsApp/Telegram/etc (future)
- **channel.notifications**: push/email/SMS (mobile + alerts) (post-MVP, in scope)
- **memory.backend**: indexing + search implementation

A single plugin may provide multiple kinds (e.g., MetaAPI broker + market data).

---

### 2) Registry model

The gateway hosts a central registry:

- connectors
- feeds
- channels
- memory backends

Each registration includes:

- plugin id
- capabilities
- health/status hooks
- configuration schema
- runtime handle

Key constraint (OpenClaw-inspired): **only one memory backend can be active at a time**.

We call these “slots”.

---

### 3) Plugin discovery (origins)

Plugins can come from:

- **built-in** plugins shipped with the repo
- **workspace** plugins in `./plugins/`
- **user** plugins in a per-user directory (future)
- **explicit config** paths

Load order matters. A later plugin must not silently override earlier ones unless explicitly configured.

---

### 4) Plugin manifest (proposed)

Each plugin has a manifest file:

- `plugin.json` (stable JSON)

Example:

```json
{
  "id": "metaapi-mcp",
  "name": "MetaAPI MCP Connector",
  "version": "0.1.0",
  "kinds": ["connector.broker", "connector.marketData"],
  "entry": {
    "type": "external.mcp",
    "url": "http://localhost:3000/sse"
  },
  "configSchema": {
    "type": "object",
    "properties": {
      "token": { "type": "string", "description": "MetaAPI token" },
      "allowedAccounts": { "type": "array", "items": { "type": "string" } }
    },
    "required": ["token"]
  },
  "capabilities": {
    "orderTypes": ["market", "limit", "stop"],
    "supportsTrailingSL": true,
    "supportsTicks": true
  }
}
```

Notes:

- We keep the manifest **boring and explicit**.
- The gateway validates config **before** registering capabilities.

For code plugins (future), `entry.type` could be:

- `python.module`
- `node.module`

…but MVP can be “external.mcp” first.

---

### 5) External MCP plugins (recommended for connectors)

For broker connectivity, we strongly prefer MCP services because:

- broker SDKs vary widely
- running them separately isolates failures and restarts
- contract tests can be reused from MCP server repos

The MetaAPI reference MCP server provides 32 tools and an SSE transport.

Doc: `docs/architecture/CONNECTORS_METAAPI_MCP.md`.

---

### 6) Slot system (OpenClaw-inspired)

Some capabilities are mutually exclusive:

- memory backend: only one active index/search provider

Config chooses the active provider:

- `plugins.slots.memory = "sqlite_fts"` or `"hybrid_embeddings"` etc.

If multiple plugins register a memory backend:

- the slot winner is chosen by config
- others remain loaded but inactive (or disabled)

---

### 7) Plugin lifecycle

For each discovered plugin:

- read `plugin.json`
- validate JSON schema
- validate config against `configSchema`
- initialize runtime:
  - for `external.mcp`: create MCP client handle
  - for code: import module and call `register(api)`
- register capabilities into registry
- emit diagnostics

On shutdown:

- close runtime handles
- flush logs
- optionally persist plugin state

---

### 8) Plugin diagnostics and safety

Plugins are an attack surface.

Minimum safety rules:

- allowlist/denylist plugin ids
- mark secrets as sensitive in config (never log)
- isolate external plugins by network boundaries

Future (optional):

- plugin signatures
- sandboxed code plugins
- permission prompts for high-risk capabilities

