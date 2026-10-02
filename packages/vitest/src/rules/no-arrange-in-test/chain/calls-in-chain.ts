import { unwrapAwaitedExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

export function callsInChain(expression: ESTree.Expression): ESTree.CallExpression[] {
	const calls: ESTree.CallExpression[] = [];
	let current: ESTree.Node = unwrapAwaitedExpression(expression);

	while (current.type === "CallExpression") {
		calls.push(current);

		const callee: ESTree.Node = unwrapAwaitedExpression(current.callee);
		if (callee.type !== "MemberExpression") {
			break;
		}

		current = unwrapAwaitedExpression(callee.object);
	}

	return calls;
}
