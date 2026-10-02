import type { ESTree } from "@oxlint/plugins";

import type { EqualityMatcher } from "./equality-matcher-name";
import { equalityMatcherName } from "./equality-matcher-name";
import { expectCallFromMatcherCallee } from "./expect-call-from-matcher-callee";

export interface EqualityAssertion {
	actual: ESTree.Expression;
	expected: ESTree.Expression;
	matcher: EqualityMatcher;
}

/**
 * An `expect(actual).toEqual(expected)`-shaped call we can analyze.
 *
 * The matcher may be `toBe`, `toEqual`, or `toStrictEqual`. An optional `.not`
 * may sit between `expect(...)` and the matcher. `.resolves` / `.rejects` are
 * rejected: those matchers compare the settled value, not the `expect(...)`
 * argument.
 */
export function equalityAssertionFromCall(node: ESTree.CallExpression): EqualityAssertion | null {
	const matcher = equalityMatcherName(node);
	if (matcher === null) {
		return null;
	}

	const expectCall = expectCallFromMatcherCallee(node.callee);
	if (expectCall === null) {
		return null;
	}

	const actual = expectCall.arguments[0];
	if (actual === undefined || actual.type === "SpreadElement") {
		return null;
	}

	const expected = node.arguments[0];
	if (expected === undefined || expected.type === "SpreadElement") {
		return null;
	}

	return { actual, expected, matcher };
}
