## MT5 Claude Trader v2

This repo is a **docs-first rewrite** of `mt5-claude-trader` (v1) into a modular, OpenClaw-inspired architecture:

- **Gateway-centric** server (WebSocket + JSON-RPC) as the single control plane
- **Pluggable connectors** (MT5/MetaAPI first; Binance/TradingView later)
- **Data feeds + hooks** to trigger agents event-driven (reduce LLM cost)
- **Copy-trading marketplace ready**: signals as feeds + deterministic copy-trade hook type (post-MVP, in scope)
- **Per-agent queues** inspired by OpenClaw (followup/interrupt/collect/steer-backlog)
- **Local-first memory + journaling** (file + SQLite FTS, then hybrid embeddings)
- **Multi-client**: web dashboard first; protocol supports future mobile clients (post-MVP, in scope)
- **Strict TDD**: no production code without a failing test first

### Start here

- Read `docs/README.md` for the documentation index.

### References we’re borrowing from

- OpenClaw architecture guide: `https://www.globalbuilders.club/blog/openclaw-codebase-technical-guide`
- TDD rules: `https://raw.githubusercontent.com/obra/superpowers/refs/heads/main/skills/test-driven-development/SKILL.md`
- Testing anti-patterns: `https://raw.githubusercontent.com/obra/superpowers/refs/heads/main/skills/test-driven-development/testing-anti-patterns.md`

