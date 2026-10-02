import type { FunctionNode } from "@gabroberge/oxlint-estree";
import type { ESTree, VisitorWithHooks } from "@oxlint/plugins";

import { describeCallbackFromCall } from "../../../test-call";

export interface OutermostDescribe {
	enterFunction(node: FunctionNode): void;
	exitFunction(node: FunctionNode): void;
	isOutermost(): boolean;
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
 * Lexical outermost `describe` during a file walk. The stack is empty before
 * any describe callback is entered, and again after it exits. A `describe`
 * inside a helper is still outermost: only remembered describe callbacks
 * push. Factory calls are not remembered.
 *
 * Call `note` for every `CallExpression` so nested bodies can be recognized
 * before asking whether the current position is outermost.
 */
export function createOutermostDescribe(): OutermostDescribe {
	const describeCallbacks = new WeakSet<FunctionNode>();
	const describeStack: FunctionNode[] = [];

	function enterFunction(node: FunctionNode): void {
		if (describeCallbacks.has(node)) {
			describeStack.push(node);
		}
	}

	function exitFunction(node: FunctionNode): void {
		if (describeStack.at(-1) === node) {
			describeStack.pop();
		}
	}

	return {
		enterFunction,
		exitFunction,
		isOutermost(): boolean {
			return describeStack.length === 0;
		},
		note(node: ESTree.CallExpression): void {
			const callback = describeCallbackFromCall(node);
			if (callback !== null) {
				describeCallbacks.add(callback);
			}
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
