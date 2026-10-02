---
name: fix-nestjs-ordered-dto-test-groups
description: Resolves remaining ESLint nestjs/ordered-dto-test-groups violations after the autofix, by inspecting which direct suite child could not be classified or moved safely. Use when a DTO spec still reports nestjs/ordered-dto-test-groups, or when a *.dto.spec.ts suite cannot be ordered as setup, then when groups, then property groups.
---

# NestJS ordered DTO test groups

Apply the ESLint autofix for `nestjs/ordered-dto-test-groups` first. It owns every reorder it can classify safely. Do not hand-edit order the fixer can produce.

This skill is for a violation that remains after that autofix.

## What the rule detects

The rule applies to `*.dto.spec.ts`. It inspects only the direct children of the outermost suite `describe`. Canonical order is:

1. Suite preamble/setup, in source order (`beforeEach`, declarations, helpers, and other non-`describe` / `it` / `test` statements).
2. DTO-level `describe` / supported `describe.each` blocks whose static title starts with the whole word `when`, in their existing relative order.
3. Single-property `describe("<propertyName>")` blocks, sorted alphabetically by that static title.

A property group is a direct-child `describe` whose static title matches the property-container convention: one identifier, a letter then letters or digits. The identifier `when` is a property title, not a `when` group.

A remaining violation is an inspection point. The fixer did not move anything, or a child could not be classified as setup, a DTO-level `when` scenario, or a property group.

## What the autofix owns

When every relevant direct child can be classified, the fixer reorders complete top-level statements into canonical order. It preserves:

- the complete source text of each moved statement
- comments attached to that statement
- blank-line formatting as much as practical
- relative order of preamble statements
- relative order of DTO-level `when` groups
- complete contents of every property group, including nested `describe` blocks

It does not rename titles, infer property ownership, create property groups, merge duplicates, move scenarios into or out of property groups, or edit setup, test bodies, fixtures, parameterization, or assertions.

Do not reproduce that reorder by hand. Run the autofix, then look only at violations that are still reported.

## Violations the fixer leaves

Determine which direct child prevented the mechanical ordering. Ask whether that child can safely be classified as:

- suite preamble/setup
- DTO-level `when` scenario
- single-property group

Typical leftovers:

- a title that is not a static string
- a `describe` title that is neither a property identifier nor a leading `when`
- a direct-child `it` / `test`
- two children sharing a line
- a comment whose attachment to one child is not mechanical

If the intended category is clear from the existing test structure, make the smallest structural change that lets the rule classify or move that child, then rerun the autofix.

Small enough changes include splitting same-line statements, attaching a comment to the statement it already documents, or writing an already-known static title as a string literal.

Do not rename a title to invent a category. Do not wrap tests into new property groups. Do not move a scenario into or out of a property group. Do not reorder DTO-level `when` groups relative to each other.

## Ambiguous cases

If classification requires semantic judgment that is not clear from the existing test, leave the violation and report the ambiguity.

A remaining lint error is preferable to a guessed category.

## Preserve the suite

Do not redesign DTO tests. Do not create a new naming convention. Do not regroup property tests. Do not “improve” unrelated test structure.

Use the `nestjs-test-grammar` skill only when a name is required for a `describe` this fix already has to touch. Do not perform unrelated grammar cleanup.

## What this rule does not own

- Suite, subject, and scenario names are the `nestjs-test-grammar` skill.
- A suite title that starts with `when` is `nestjs/no-when-in-suite-title`.
- `when` in an `it` / `test` title is `nestjs/no-when-in-test-title`.
- `if` in an `it` / `test` title is `nestjs/no-if-in-test-title`.
- A test outside a nested `describe` is `nestjs/no-test-outside-describe`.
- Inherited-property coverage is `nestjs/no-inherited-property-test-matrix`.

## Scope

This remediation owns one question:

    Which direct suite child prevented mechanical ordering, and can that child be classified as setup, a DTO-level when scenario, or a property group without redesigning the spec?

Keep the change local to that question.
