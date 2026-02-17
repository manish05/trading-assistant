## Memory system (local-first, hybrid roadmap)

### 0) Why memory matters for trading agents

A trading agent without memory becomes:

- inconsistent (forgets your rules)
- un-auditable (“why did it do that?”)
- non-improving (doesn’t learn from mistakes)

We want memory to support:

- **protocol recall**: manual + rules are always in context
- **experience recall**: similar past trades and outcomes
- **operational recall**: “what went wrong last time MetaAPI disconnected?”
- **explanations**: citations to the exact notes that justify actions

OpenClaw’s memory system is a hybrid BM25 + vector search over SQLite.

Reference: `https://www.globalbuilders.club/blog/openclaw-codebase-technical-guide`.

---

### 1) Memory sources

We index these sources:

#### 1.1 Agent workspace documents
- `SOUL.md`
- `TRADING_MANUAL.md`
- `journal/**/*.md`
- `memory/**/*.md`
- strategy notes and artifacts (optional)

#### 1.2 Run transcripts and decision traces
- run input snapshots (event payload + market/account snapshot)
- blocks emitted
- trade intents and risk decisions

These are high-signal for “what happened before”.

#### 1.3 Global docs (optional)
- shared playbooks
- incident runbooks

---

### 2) Retrieval contract (what the agent gets)

When an agent run starts, memory retrieval should return **citations**, not just text blobs.

Each result contains:

- file path
- line range
- snippet
- score
- source type

Example:

```json
{
  "path": "agents/agent_btc_5m/TRADING_MANUAL.md",
  "startLine": 42,
  "endLine": 58,
  "score": 0.82,
  "snippet": "Never trade unless two consecutive 5m candles are green...",
  "source": "fts"
}
```

These citations are:

- attached to run records
- optionally shown in UI (“why did you do this?”)

---

### 3) MVP implementation (SQLite FTS only)

#### 3.1 Why start with FTS
- simple
- fast
- local-only
- deterministic

It supports the most important behavior:

- “find the rule that matches this situation”

#### 3.2 Index design
Store:

- document path
- content
- metadata (agentId, type)

Use:

- SQLite FTS5 for keyword search

Chunking:

- chunk markdown by headings or token windows
- keep chunk sizes moderate (e.g., 400–800 tokens) so citations are precise

Change detection:

- file hashing
- only reindex changed chunks

---

### 4) Roadmap: hybrid embeddings + FTS (OpenClaw-inspired)

FTS alone misses semantic similarity.

Hybrid system:

- vector embeddings for semantic recall
- FTS for exact keyword recall
- merge results with weighted scoring

OpenClaw pattern:

- SQLite + FTS5 + vector columns
- hybrid merge default ~50/50

We will mirror this in v2 once MVP is stable.

#### 4.1 Embedding providers (options)
- remote: OpenAI/Gemini/Voyage embeddings
- local: llama.cpp embeddings (GGUF)

We choose later. The doc specifies the interface so we can swap providers.

#### 4.2 Hybrid merge strategy
Let:

- \(s_{fts}\) be normalized BM25 score
- \(s_{vec}\) be cosine similarity

Compute:

- \(s = w_{fts} s_{fts} + w_{vec} s_{vec}\)

Default weights:

- \(w_{fts}=0.5\)
- \(w_{vec}=0.5\)

Filter:

- minimum score threshold
- per-source caps

---

### 5) Memory write policy (what the agent is allowed to write)

Agents should not be able to rewrite their entire manual automatically.

Policy:

- agent may append:
  - journal entries
  - learnings (additive)
  - notes
- agent may propose edits to manual (requires approval in UI) (future)

All writes must:

- be attributed to a runId
- be visible to the user

---

### 6) Indexing triggers

Index updates occur on:

- file changes (watcher)
- scheduled sync (every N minutes)
- explicit `memory.reindex` call (admin)

Index health signals:

- last sync time
- number of docs/chunks
- indexing errors

---

### 7) Slot system (memory backend)

As in OpenClaw, only one memory backend is active:

- `sqlite_fts` (MVP)
- `hybrid_embeddings` (later)

Config selects the slot winner.

---

### 8) Backtesting and memory

Backtest reports are memory artifacts.

We want:

- “show me backtests similar to this one”
- “why did we stop using strategy X?”

So backtest report summaries are indexed like any other doc.

