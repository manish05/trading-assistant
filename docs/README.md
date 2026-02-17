## Documentation index

This project is being built **docs-first**. Read these in order:

### Product docs

- `docs/product/PRD.md`: complete Product Requirements Document
- `docs/product/USER_FLOWS.md`: end-to-end user flows (onboarding → agents → intervention → emergency)
- `docs/product/UI_SPEC.md`: dashboard layout, interactions, “blocks” UX, and settings philosophy

### Architecture docs (OpenClaw-inspired)

- `docs/architecture/ARCHITECTURE_OVERVIEW.md`: systems diagram + boundaries
- `docs/architecture/TECHNICAL_ARCHITECTURE.md`: implementation-ready architecture + common libraries (from OpenClaw code references)
- `docs/architecture/GATEWAY_PROTOCOL.md`: JSON-RPC over WebSocket, events, auth, streaming
- `docs/architecture/PLUGIN_SYSTEM.md`: plugin model, manifests, config schema, lifecycle
- `docs/architecture/CONFIG_SPEC.md`: config format, schema expectations, reload rules
- `docs/architecture/CONNECTORS_METAAPI_MCP.md`: MetaAPI MCP integration contract
- `docs/architecture/FEEDS_AND_HOOKS.md`: data feeds, wake hooks, auto-trade hooks, scheduling
- `docs/architecture/QUEUES.md`: per-agent queue modes and dedupe/drop policies
- `docs/architecture/AGENTS.md`: agent workspace, SOUL, journaling, subagents, run lifecycle
- `docs/architecture/DOMAIN_MODEL.md`: core types and invariants used across the system
- `docs/architecture/MEMORY.md`: local-first memory design + hybrid search roadmap
- `docs/architecture/RISK_AND_SAFETY.md`: risk policy model, guardrails, emergency stop
- `docs/architecture/BACKTESTING.md`: backtest pipeline and UI output contract

### Dev docs

- `docs/dev/TDD.md`: strict TDD rules + testing anti-patterns adapted for this repo
- `docs/dev/DEV_WORKFLOW.md`: local dev workflow (bun + Python), naming, conventions

### Specs

- `docs/specs/BLOCKS_SPEC.md`: the structured “UI blocks” format the agent/gateway can emit

