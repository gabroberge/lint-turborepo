---
name: fix-nestjs-redundant-wiring-test
description: Resolves remaining ESLint nestjs/no-redundant-wiring-test violations after the autofix, by removing a minimal wiring test the fixer could not delete safely. Use when a spec still reports nestjs/no-redundant-wiring-test, or when a test body is only expect(value).toBeDefined() beside another executable test.
---

# NestJS redundant wiring tests

A minimal wiring test is temporary scaffolding. While it is the suite's only executable test, it checks that the subject and its dependencies were wired into the harness. It becomes redundant as soon as the suite contains another executable test. The usual case is a behavioral test: successful construction is already required for that test to run.

Apply the ESLint autofix for `nestjs/no-redundant-wiring-test` first. It owns every removal it can classify safely. Do not hand-edit a test the fixer can delete.

This skill is for a violation that remains after that autofix.

## What the rule detects

The title is ignored. A test is a wiring test only when its body is minimal:

- a block whose every statement is `expect(value).toBeDefined()`, or
- an expression-bodied arrow that is that same call.

`value` may be wrapped in parentheses, a non-null assertion, `as`, or `satisfies`. Several `toBeDefined()` assertions are still one wiring test.

The body is not a wiring test when it contains anything else: another matcher, a call, an assignment, mock setup, or any other statement. Helpers are not inspected. Only the identifier `expect` and the matcher `toBeDefined` with no arguments count.

The suite is the outermost `describe`. Another executable `it` / `test` anywhere inside it, including inside a nested `describe`, makes the wiring test redundant. A separate top-level `describe` is a different suite. A wiring test with no `describe` is not reported.

`it` / `test` with a callback counts, including `skip`, `only`, `each`, `for`, and the other supported modifiers. `it.todo` / `test.todo` do not count, with or without a callback. A test with no callback does not count. A callback passed by identifier counts as another executable test, but its body is not inspected, so it is not classified as a wiring test. `it.each(table)` and `it.skipIf(condition)` are factories; the call that receives the title is the test.

The only executable test in the suite may be a wiring test. Two wiring tests make each other redundant. The fixer removes both. Do not keep one on the grounds that deleting the other would leave a sole wiring test.

```ts
it("should be defined", () => {
	expect(service).toBeDefined();
	expect(repository).toBeDefined();
	expect(client).toBeDefined();
});
```

Beside another executable test, that whole `it` is the violation. `toBeDefined()` inside a test that also acts or asserts behavior is not.

## What the autofix owns

The fixer removes the wiring-test statement, its indent, semicolon, and terminating newline. It also removes contiguous full-line comments directly above that statement: a `//` line, or a `/* ... */` that opens and closes on one line. A blank line stops that scan.

It does not move assertions, edit setup, edit neighboring tests, drop unused variables, or reorganize `describe` blocks. A nested `describe` that becomes empty stays empty. Comments that do not belong to the removed statement stay.

Do not reproduce that edit by hand. Run the autofix, then look only at violations that are still reported.

## Violations the fixer leaves

The fixer reports without a fix when removing the statement would change surrounding syntax, or a comment on the statement's lines might belong to something else:

- a trailing `//` or `/*` on the test's line
- a block comment above the test that spans lines
- the `it` / `test` is not the whole statement, such as `const defined = it(...)`
- another token shares the line, such as two tests written on one line

The report is still a redundant wiring test. Remove only that test.

Read a comment the fixer refused. If it describes only the wiring test, remove it with the test. If it describes the suite, the next test, or anything else, keep it where it is.

```ts
it("should be defined", () => {
	expect(service).toBeDefined();
}); // documents the next case
it("returns the account", () => {
	expect(account.id).toBe(1);
});
```

Delete the wiring `it`. Leave the comment with the next test.

If the call is not the whole statement, delete it only when the rest of the statement exists to register that test. If the statement also binds or computes something else, leave the violation and report that the wiring test is not separable.

If another test shares the line, delete only the wiring call.

## Preserve the suite

Do not copy `toBeDefined()` into a behavioral test to make the violation disappear.

Do not add a behavioral test so that a sole wiring test becomes deletable. A sole wiring test is not reported.

Do not remove `beforeEach`, providers, mocks, or variables because the deleted test was their only reader. Leave that unused setup to the lint rule that reports it, or to a separate cleanup, unless the repository's existing conventions make the removal mechanically unavoidable. A binding that is the wiring-test statement itself is part of removing the test, not a cleanup sweep.

Do not delete an empty `describe` the fixer left behind. Do not rename suites, move tests, or otherwise restructure the file. Use the `nestjs-test-grammar` skill only when a name is required for a `describe` this fix already has to touch. This rule does not add or rename `describe` blocks.

If the wiring test cannot be removed without taking unrelated syntax with it, leave the violation and say what could not be separated.

## What this rule does not own

- Suite, subject, and scenario names are the `nestjs-test-grammar` skill.
- A suite title that starts with `when` is `nestjs/no-when-in-suite-title`.
- `when` in an `it` / `test` title is `nestjs/no-when-in-test-title`. Apply that autofix first when it also reports.
- `if` in an `it` / `test` title is `nestjs/no-if-in-test-title`.
- A test outside a nested `describe` is `nestjs/no-test-outside-describe`.
- Mock and spy setup inside the test is `nestjs/no-arrange-in-test`.
- A missing `expect` is `nestjs/require-expect`. A tautological equality is `nestjs/no-tautological-equality`.
- Identical test bodies are `nestjs/no-identical-test-body`.
- A one-case `.each` is `nestjs/no-single-case-each`.
- Inherited-property coverage is `nestjs/no-inherited-property-test-matrix`.

## Scope

This remediation owns one question:

    Is this standalone wiring test still necessary now that the suite contains behavioral tests?

The rule answers that from structure. It is necessary only when it is the suite's only executable test. It is not necessary when any other executable test shares that suite.

Keep the change local to that question.
