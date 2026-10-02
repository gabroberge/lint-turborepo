---
"@gabroberge/eslint-plugin-vitest": minor
---

Add the initial Nest/Vitest test lint rules.

- `no-arrange-in-test` — disallow mock and spy setup inside `it` / `test`
- `no-generic-http-exception-assertion` — disallow assertions that only name a Nest HTTP exception type
- `no-identical-test-body` — disallow an `it` / `test` body that repeats an earlier test in the same suite
- `no-if-in-test-title` — require inspection when an `it` / `test` title contains `if`
- `no-inherited-property-test-matrix` — disallow a subclass test that covers one inherited property on its own
- `no-redundant-wiring-test` — disallow a minimal wiring test when its suite contains another executable test
- `no-single-case-each` — disallow `.each` with exactly one case
- `no-spy-on-outside-before-each` — require `vi.spyOn` to be created inside `beforeEach`
- `no-tautological-equality` — disallow equality assertions that compare a value with itself
- `no-test-outside-describe` — require each `it` / `test` to be nested inside a `describe` below the suite
- `no-when-in-suite-title` — disallow a suite `describe` title that starts with `when`
- `no-when-in-test-title` — require a `when` condition to be a `describe` title, not an `it` / `test` title
- `ordered-dto-test-groups` — require a DTO spec suite to list setup, then `when` describes, then property describes
- `require-expect` — require each `it` / `test` to call `expect` in its own body
