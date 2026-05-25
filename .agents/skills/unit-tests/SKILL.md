---
name: unit-tests
description: |
  Guardrails for adding unit tests in bklit-ui without over-testing. Use when the
  user mentions unit test, unit tests, tests, test coverage, add tests, write tests,
  vitest, jest, or asks whether something should be tested.
---

# Unit Tests (bklit-ui)

Read this skill before proposing or writing tests. **Default stance: fewer, higher-signal tests.**

---

## When to add tests

Add tests when they **lock in behavior that is easy to break silently**:

| Worth testing | Why |
|---------------|-----|
| Pure functions / modules | Stable inputs → outputs; fast; no DOM |
| Formatters, parsers, scale math, bounds | Regression on string/number output is user-visible |
| Codegen / export / registry helpers | Output shape is the contract |
| Non-obvious edge cases | Empty data, reversed ranges, clamping |

**Examples in this repo:** `chart-formatters.test.ts`, `highlight-segment-bounds.test.ts`, `animation.test.ts`, `apps/web/lib/studio/__tests__/*`.

---

## When NOT to add tests (unless explicitly requested)

Do **not** add tests just to increase coverage or “be thorough”:

| Skip | Why |
|------|-----|
| React component render smoke tests | visx, motion, portals → brittle; manual/docs check is cheaper |
| `memo()` / guard extractions (#65-style) | Structural perf refactors; output unchanged; RTL mount assertions are heavy |
| Default prop passthrough | `formatValue = intFmt` — types + formatter tests cover it |
| Third-party library behavior | Don’t re-test d3, visx, or React |
| Trivial getters / one-line wrappers | No regression signal |
| Snapshot entire chart SVG/JSX | High churn, low signal |

If the user asks “should we test X?” — **say no** when X falls in this table, and suggest a lighter alternative (pure helper test, manual check, CI build).

---

## Repo conventions

**Runner:** Node built-in test runner + `tsx` (not Jest/Vitest unless the repo adopts them later).

```bash
pnpm test              # root — turbo runs packages with a test script
pnpm --filter @bklitui/ui test
cd apps/web && pnpm test
```

**Place tests:** `**/__tests__/**/*.test.ts` next to the code under test.

**Pattern:**

```ts
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { myFn } from "../my-module";

describe("myFn", () => {
  it("handles empty input", () => {
    assert.equal(myFn([]), expected);
  });
});
```

**Equivalence tests** (preferred for formatters): assert shared module output matches the **previous inline** call (e.g. `toLocaleDateString` with same locale/options) so tests stay timezone-safe and prove no visual regression.

**New package test script:** add to `package.json`:

```json
"test": "node scripts/run-tests.mjs"
```

Use a small `scripts/run-tests.mjs` that collects `*.test.ts` from `__tests__` and invokes `node --import tsx --test` — shell globs break on Linux CI. Add `tsx` as a devDependency if missing. Wire into root `turbo.json` `test` task; CI runs `pnpm test`.

---

## Decision checklist (run before writing)

1. Is the logic **pure** or extractable to pure functions? → Test that. Consider extracting first.
2. Would a test fail on a **real user-visible bug**? → Good candidate.
3. Does it need **jsdom / RTL / Playwright**? → Stop; justify to user or defer to manual/visual check.
4. Did the user **ask** for tests? → Still apply this skill; don’t over-deliver.
5. How many cases? → **3–10 focused cases**, not exhaustive matrices.

---

## What to tell the user

When recommending tests, be explicit:

- **Add:** “Test `chart-formatters.ts` — pure, high regression value.”
- **Skip:** “Skip component tests for the memo split — no output change; build + manual chart docs are enough.”
- **CI:** Mention `pnpm test` in PR test plan when adding or changing tests.

---

## Anti-patterns

- Adding Jest/Vitest/Testing Library for a one-off without team buy-in
- Mocking entire chart context to assert `useMemo` call counts
- Testing implementation details (hook order, internal component names)
- Duplicating type-checker work (`expect(typeof x).toBe('function')`)
- Committing tests that only pass locally due to hard-coded timezone/locale strings
