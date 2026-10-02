---
name: fix-nestjs-identical-test-body
description: Resolves ESLint nestjs/no-identical-test-body violations in Nest/Vitest specs by investigating test intent, not mechanically deduplicating bodies. Use when fixing identical test body lint errors, deduplicating specs, or reviewing paired tests flagged by nestjs/no-identical-test-body.
---

# Fix `nestjs/no-identical-test-body`

## Core idea

An identical test body is a signal to investigate intent, not an instruction to deduplicate code.

For each violation, inspect both tests, their titles, surrounding `describe` contexts, setup (`beforeEach` / local arrange), inputs, and the production behavior they claim to test before deciding what to change.

Read the relevant production code (handler, DTO, validator, pure function) when needed to learn what distinct outcomes or branches exist.

## Test structure (this repo)

- **`describe`**: context / scenario / subject boundary
- **`beforeEach`**: shared Arrange for that context
- **`it` / `test`**: Act + Assert only when possible

Prefer the smallest change that makes each remaining test truthful about what it proves.

## Decision workflow

1. **List the paired tests** ESLint reports (file + line → find the other test with the same body).
2. **Ask the title heuristic** for each test:
    - _If the behavior named in the `it` were removed, could this test still pass?_
    - If yes → the test does not protect what its title claims → **repair** (inputs, mocks, or assertions), not rename.
3. **Compare titles and inputs**:
    - Same title intent + same inputs + same observations → likely **true duplicate** → keep the clearest test.
    - Same assertion, different **semantic** inputs (payment method, branch, validator rule) → usually **not** one `it.each`; use separate cases or nested `describe` with scenario-specific `beforeEach`.
    - Same `it.each` body, different datasets for the **same** invariant → **combine** datasets into one parameterized test.
4. **Pick the fix that matches the diagnosis** (below—not a fixed priority order). If you separate invariants, partition each dataset so every input reaches the invariant its context names. Re-run lint and the affected spec file(s).

## Fixes by diagnosis

### Remove a true duplicate

Same behavior, same inputs, same observations—only titles differ. Keep the clearest title; delete the other. Do not keep two tests “because the titles differ.”

_Example:_ `complete-autocab-transaction.handler.spec.ts` — “run with correct parameters for cash” duplicated “complete cash transaction” (same `run` assertion).

### Combine `it.each` only for the same semantic behavior

Merge datasets when they are multiple inputs proving **one** invariant (e.g. invalid email shapes + malformed email strings → one “invalid email” table).

Do **not** merge parameterized datasets merely because their bodies are identical. Merge them when they represent multiple inputs for the same semantic behavior.

Pay particular attention when the titles refer to different properties, methods, branches, or invariants. Identical bodies in that situation may indicate that one test is wired to the wrong input or is not exercising what its title claims.

_Counter-example (keep separate):_ “uuid is not of type string” vs “uuid is not a uuid v4” are different invariants even if both end in `rejects.toBeInstanceOf(UnprocessableEntityException)`. Prefer two `it.each` blocks or nested `describe` contexts—not one merged table with a vague title. Each table should contain only values that reach that invariant.

### Nested `describe` for distinct scenarios with shared Act + Assert

When scenarios differ meaningfully (cash vs credit card error swallowing, different `beforeEach` event fixtures) but Act + Assert match, move scenario-specific Arrange into `describe` + `beforeEach` rather than duplicating leaf tests.

Do not add meaningless nested `describe` blocks only to satisfy the linter—the `describe` must name a real precondition, subject, or behavior boundary.

Splitting contexts is not enough. Partition the inputs so each context isolates the invariant it names.

After restructuring the tests, for every input in a dataset, ask:

_Does this input reach and exercise the invariant named by this context, or does it already fail an earlier or different invariant?_

If it fails another invariant first, move it to the context that owns that failure, or remove it. Do not preserve overlapping coverage. A later context should contain only values that pass the earlier checks and fail the check that context names.

### Repair a misleading test body

Titles that name a **specific** collaborator or method must assert that collaborator, not only `expect.any(Function)` on a runner.

_Example:_ “should call `markBookingPaymentAsFailed`” → mock `dispatchSolutionsRequestRunnerService.run` to invoke the callback, then assert `paymentClient.markBookingPaymentAsFailed(...)` with expected credentials and booking id. Keep a separate test for runner metadata (`type`, `dispatchTripId`, etc.) if that contract matters.

### Fix wrong or accidental inputs

Two titles may imply different cases but use the same payload (e.g. “empty” vs “missing tripId and syncId”). Align input with the title or drop the redundant case.

When two titles refer to different properties, verify that each parameterized value is actually assigned to the property named by that test.

## Forbidden shortcuts

- Do not change production code to satisfy this lint.
- Do not disable `nestjs/no-identical-test-body` or add `eslint-disable` for it.
- Do not weaken assertions.
- Do not add meaningless assertions or empty `describe` blocks only to differ bodies.
- Do not rename a test to match a broken body instead of fixing the body.
- Do not blindly delete the second occurrence without intent analysis.
- Do not stop after moving identical bodies into different `describe` blocks. Partition datasets so each input exercises the invariant that context names.

## Verification

1. `npm run lint` — zero `nestjs/no-identical-test-body` in touched files (full lint if sweeping the repo).
2. `npm test -- <affected.spec.ts>` — all tests in modified files pass.
3. Skim the diff: no hollow describes, no renamed duplicates, no merged tables that blur distinct invariants, and no inputs left in a context they cannot reach.

## Reporting (when asked)

Summarize fixes by category: deleted duplicates, combined parameterized cases, repaired inputs/assertions, semantic grouping via `describe`, tests left separate on purpose (and why).
