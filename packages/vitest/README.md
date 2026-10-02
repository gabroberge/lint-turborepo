# @gabroberge/eslint-plugin-vitest

Nest/Vitest lint rules for how a spec is structured: suite vs scenario, arrange vs act, and what a test is allowed to assert.

The plugin registers as `vitestExtended`. Enable `configs.recommended` for the rules that are cheap to enforce automatically. `configs.all` also turns on the rules that need more judgment.

## Install

```bash
npm install -D @gabroberge/eslint-plugin-vitest
```

## Usage

### ESLint flat config

```js
import vitestExtended from "@gabroberge/eslint-plugin-vitest";

export default [vitestExtended.configs.recommended];
```

### Oxlint

```json
{
	"jsPlugins": ["@gabroberge/eslint-plugin-vitest"],
	"rules": {
		"vitestExtended/require-expect": "error"
	}
}
```

## Configs

| Config                | What it enables                                           |
| --------------------- | --------------------------------------------------------- |
| `configs.recommended` | Rules marked recommended, at each rule's default severity |
| `configs.all`         | Every rule, at each rule's default severity               |

## Rules

| Rule                                                 | Recommended | Fix | Default | What it reports                                                           |
| ---------------------------------------------------- | ----------- | --- | ------- | ------------------------------------------------------------------------- |
| `vitestExtended/no-identical-test-body`              | yes         |     | error   | An `it` / `test` body that repeats an earlier test in the same `describe` |
| `vitestExtended/no-if-in-test-title`                 | yes         |     | error   | An `it` / `test` title that contains `if`                                 |
| `vitestExtended/no-single-case-each`                 | yes         |     | error   | `.each` with exactly one statically known case                            |
| `vitestExtended/no-spy-on-outside-before-each`       | yes         |     | error   | `vi.spyOn` created outside `beforeEach`                                   |
| `vitestExtended/no-tautological-equality`            | yes         |     | error   | Equality that compares a value with itself or a sole spread of itself     |
| `vitestExtended/no-test-outside-describe`            | yes         |     | error   | An `it` / `test` outside a `describe` nested below the suite              |
| `vitestExtended/no-when-in-test-title`               | yes         | yes | error   | A `when` condition in an `it` / `test` title                              |
| `vitestExtended/require-expect`                      | yes         |     | error   | An `it` / `test` that never calls `expect` in its own body                |
| `vitestExtended/no-arrange-in-test`                  |             |     | error   | Mock or spy setup inside `it` / `test`                                    |
| `vitestExtended/no-generic-http-exception-assertion` |             |     | warn    | An assertion that only names a Nest HTTP exception type                   |
| `vitestExtended/no-inherited-property-test-matrix`   |             |     | error   | A subclass test that covers one inherited property on its own             |
| `vitestExtended/no-redundant-wiring-test`            |             | yes | error   | A minimal `toBeDefined()` wiring test beside another executable test      |
| `vitestExtended/no-when-in-suite-title`              |             |     | error   | A suite `describe` title that starts with `when`                          |
| `vitestExtended/ordered-dto-test-groups`             |             | yes | error   | A `*.dto.spec.ts` suite that is not setup, then `when`, then properties   |

`no-generic-http-exception-assertion` accepts `exceptionNames`, `exemptFilePatterns`, `matchers`, and `testFilePatterns`.

The test grammar those rules assume is in [`docs/test-grammar.md`](https://github.com/gabroberge/lint-turborepo/blob/master/docs/test-grammar.md).
