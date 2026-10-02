/**
 * Disallow scenario setup inside an `it` / `test`.
 *
 * A `describe` names the subject or scenario. `beforeEach` arranges that
 * scenario. The test acts and asserts. This rule reports only the mock and spy
 * setup listed below. It does not require a `beforeEach`, and it does not
 * decide whether the enclosing `describe` is a subject or a scenario.
 *
 * Setup this rule reports:
 * - Mock configuration: `mockResolvedValue[Once]`, `mockRejectedValue[Once]`,
 *   `mockReturnValue[Once]`, `mockImplementation[Once]`, and `mockReset` /
 *   `mockRestore` / `mockClear`. These arrange the scenario. Put teardown in
 *   `afterEach`.
 * - `vi.fn()` / `jest.fn()` as its own statement, on the right-hand side of an
 *   assignment, or as a variable's initial value
 * - `vi.spyOn` / `jest.spyOn` as its own statement or on the right-hand side of
 *   an assignment, or any spy chain that also configures the mock. A
 *   `const spy = vi.spyOn(...)` kept so a later `expect(spy)` can observe calls
 *   is part of the act and is not reported.
 *
 * Left alone, rather than guessed:
 * - `new` expressions, fixture or builder calls, and other assignments. Those
 *   are easy to confuse with the act, for example arguments built beside the
 *   call, or `const id = AccountId.from(1)` when that value is what the test
 *   checks.
 * - Nested functions inside the test, such as assertion helpers and callbacks.
 * - How many statements a test has, and setup that is not one of the calls above.
 * - Setup already in `beforeEach`, `beforeAll`, a `describe`, or an outer helper.
 *
 * Supported test entrypoints: `it` / `test`, plus the modifiers in `test-call.ts`
 * (`only`, `skip`, `todo`, `concurrent`, `sequential`, `fails`, `failing`,
 * `skipIf`, `runIf`, `each`, and `for`), including tagged-template `each` and
 * chains such as `it.concurrent.only`. `await` in front of a mock setup call
 * does not exempt it.
 *
 * Not recognized: renamed `it`/`test` bindings, `xit` / `fit` / `xtest`, and
 * computed access such as `it["skip"]`.
 */

import type { PluginRule } from "@gabroberge/oxlint-plugin";

import { lint } from "./lint";

export const noArrangeInTestRule: PluginRule = {
	create(context) {
		return lint(context);
	},
	defaultSeverity: "error",
	meta: {
		defaultOptions: [],
		docs: {
			description: "Disallow mock and spy setup inside `it` / `test`."
		},
		messages: {
			arrangeInTest:
				"Move this setup into `beforeEach`. Use a nested `describe` when the scenario differs. The test should only act and assert."
		},
		schema: [],
		type: "problem"
	},
	name: "no-arrange-in-test"
};
