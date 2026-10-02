import type { FunctionNode } from "@gabroberge/oxlint-estree";
import type { ESTree, VisitorWithHooks } from "@oxlint/plugins";

import { describeCallbackFromCall } from "../../../test-call";
import { staticTitle } from "../title/static-title";
import { staticTitleValue } from "../title/static-title-value";

export interface DescribeScope {
	enclosingTitle(): string | null;
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

/**
 * Lexical `describe` scope during a file walk. Owns the callback titles and
 * the function-enter/exit visitors that keep the stack current.
 */
export function createDescribeScope(): DescribeScope {
	const titles = new WeakMap<FunctionNode, string | null>();
	const stack: FunctionNode[] = [];

	function enterFunction(node: FunctionNode): void {
		if (titles.has(node)) {
			stack.push(node);
		}
	}

	function exitFunction(node: FunctionNode): void {
		if (stack.at(-1) === node) {
			stack.pop();
		}
	}

	return {
		enclosingTitle() {
			const enclosing = stack.at(-1);
			if (enclosing === undefined) {
				return null;
			}

			return titles.get(enclosing) ?? null;
		},
		note(node) {
			const callback = describeCallbackFromCall(node);
			if (callback === null) {
				return;
			}

			titles.set(callback, staticTitleValue(staticTitle(node.arguments[0])));
		},
		visitors: {
			ArrowFunctionExpression: enterFunction,
			"ArrowFunctionExpression:exit": exitFunction,
			FunctionDeclaration: enterFunction,
			"FunctionDeclaration:exit": exitFunction,
			FunctionExpression: enterFunction,
			"FunctionExpression:exit": exitFunction
		}
	};
}
