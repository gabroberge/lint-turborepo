import { unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import { isExpectRoot } from "./is-expect-root";

/**
 * From `.toEqual` / `.not.toEqual` (etc.), walk to the `expect(...)` call.
 * Returns null when the root callee is not the identifier `expect`.
 *
 * Does not walk `.resolves` / `.rejects`: those matchers compare the settled
 * value, not the `expect(...)` argument.
 */
export function expectCallFromMatcherCallee(callee: ESTree.Expression): ESTree.CallExpression | null {
	let current = unwrapExpression(callee);

	if (current.type !== "MemberExpression") {
		return null;
	}

	current = unwrapExpression(current.object);

	if (
		current.type === "MemberExpression" &&
		!current.computed &&
		current.property.type === "Identifier" &&
		current.property.name === "not"
	) {
		current = unwrapExpression(current.object);
	}

	if (current.type !== "CallExpression") {
		return null;
	}

	if (!isExpectRoot(current.callee)) {
		return null;
	}

	return current;
}
