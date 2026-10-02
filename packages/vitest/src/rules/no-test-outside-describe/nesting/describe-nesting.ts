import type { FunctionNode } from "@gabroberge/oxlint-estree";
import type { ESTree, VisitorWithHooks } from "@oxlint/plugins";

import { describeCallbackFromCall } from "../../../test-call";

/**
 * Describe nesting during a file walk. The outermost describe is the suite;
 * a position is below the suite only after a further describe callback has
 * been entered. Depth is the number of those callbacks, not their titles.
 */
export interface DescribeNesting {
	enter(node: FunctionNode): void;
	exit(node: FunctionNode): void;
	isBelowSuite(): boolean;
	note(node: ESTree.CallExpression): void;
	visitors: Pick<
		VisitorWithHooks,
		| "ArrowFunctionExpression:exit"
		| "ArrowFunctionExpression"
		| "FunctionDeclaration:exit"
		| "FunctionDeclaration"
		| "FunctionExpression:exit"
		| "FunctionExpression"
	>;
}

export function createDescribeNesting(): DescribeNesting {
	const callbacks = new WeakSet<FunctionNode>();
	const stack: FunctionNode[] = [];

	function enter(node: FunctionNode): void {
		if (callbacks.has(node)) {
			stack.push(node);
		}
	}

	function exit(node: FunctionNode): void {
		if (stack.at(-1) === node) {
			stack.pop();
		}
	}

	return {
		enter,
		exit,
		isBelowSuite(): boolean {
			return stack.length > 1;
		},
		note(node: ESTree.CallExpression): void {
			const callback = describeCallbackFromCall(node);
			if (callback !== null) {
				callbacks.add(callback);
			}
		},
		visitors: {
			ArrowFunctionExpression: enter,
			"ArrowFunctionExpression:exit": exit,
			FunctionDeclaration: enter,
			"FunctionDeclaration:exit": exit,
			FunctionExpression: enter,
			"FunctionExpression:exit": exit
		}
	};
}
