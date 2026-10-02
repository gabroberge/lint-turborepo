import { unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

/**
 * The innermost callee after stripping member access, nested calls, and
 * transparent wrappers (`expect(x).toBe`, `expect.assertions`, `(expect)`).
 */
export function rootCallee(callee: ESTree.Node): ESTree.Node {
	let current: ESTree.Node = callee;

	for (;;) {
		current = unwrapExpression(current);

		if (current.type === "MemberExpression") {
			current = current.object;
			continue;
		}

		if (current.type === "CallExpression") {
			current = current.callee;
			continue;
		}

		break;
	}

	return current;
}
