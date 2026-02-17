## TDD rules for this repo (mandatory)

This project follows strict TDD.

Primary references (read fully):

- `https://raw.githubusercontent.com/obra/superpowers/refs/heads/main/skills/test-driven-development/SKILL.md`
- `https://raw.githubusercontent.com/obra/superpowers/refs/heads/main/skills/test-driven-development/testing-anti-patterns.md`

This document adapts those rules to the MT5 Claude Trader v2 codebase.

---

### 1) The Iron Law

```
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
```

If you wrote production code before a failing test:

- delete it
- write the test
- re-implement from scratch

No exceptions (except configuration files or throwaway prototypes).

---

### 2) Red → Green → Refactor (required workflow)

#### 2.1 RED — write one failing test
Rules:

- test name describes one behavior
- test uses real code, not mock behavior
- avoid broad integration unless required

#### 2.2 VERIFY RED — watch it fail correctly
Mandatory:

- the test must **fail** (not error)
- failure must be for the expected reason

If the test passes immediately, the test is wrong.

#### 2.3 GREEN — minimal code to pass
Rules:

- implement only what the test demands
- do not “future proof”
- avoid extra options / configs / abstractions

#### 2.4 VERIFY GREEN — watch all tests pass
Mandatory:

- new test passes
- existing tests still pass
- output is clean

#### 2.5 REFACTOR — only after green
Allowed:

- rename
- remove duplication
- improve structure

Not allowed:

- adding behavior without tests

---

### 3) Repo-specific test commands (planned)

We will run tests separately for backend and frontend.

Backend (Python):

- unit tests: `python -m pytest backend/tests/unit -v`
- integration tests (live): `python -m pytest backend/tests/integration -v -m live -s`

Frontend (bun):

- unit/component tests: `bun test`

Important: use **bun**, not npm.

---

### 4) Testing anti-patterns (hard rules)

Direct reference:

- `https://raw.githubusercontent.com/obra/superpowers/refs/heads/main/skills/test-driven-development/testing-anti-patterns.md`

#### 4.1 Never test mock behavior
If you assert that a mock exists, you’re not testing your system.

**Gate**:

- Before asserting on anything mocked, ask:
  - “Am I testing the behavior of a mock?”
- If yes: stop, remove assertion, or unmock and test real behavior.

#### 4.2 Never add test-only methods to production code
If a method exists only for tests (e.g., `destroy()`), move it to test utilities.

#### 4.3 Never mock without understanding dependencies
Mocking high-level behavior often removes the side effects your test depends on.

**Gate**:

- run with real implementation first
- then mock the slow/external boundary only

#### 4.4 Avoid incomplete mocks
If you must mock API responses, mock the full structure the real system returns.

---

### 5) What must be covered by tests (priorities)

Highest priority (must be test-first):

- RiskEngine decisions
- Order intent → connector mapping
- Hook evaluation decisions
- Queue mode semantics (interrupt/followup/collect)
- Idempotency and dedupe
- Emergency stop behavior

Second priority:

- Memory indexing and search
- Backtest simulation

UI priority:

- block renderer correctness
- trade overlay rendering
- user intervention controls

---

### 6) “Red flags” checklist (stop and restart)

- code written before test
- test passes immediately
- “I’ll add tests later”
- huge mocks
- test-only production methods
- “I mocked this to be safe”

All of these mean: restart with TDD.

