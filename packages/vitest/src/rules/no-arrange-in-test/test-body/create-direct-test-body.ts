import type { FunctionNode } from "@gabroberge/oxlint-estree";
import type { ESTree, VisitorWithHooks } from "@oxlint/plugins";

import { testCallbackFromCall, testFunctionName } from "../../../test-call";

export interface DirectTestBody {
	enterFunction(node: FunctionNode): void;
	exitFunction(node: FunctionNode): void;
	inDirectBody(): boolean;
	note(node: ESTree.CallExpression): void;
	remember(callback: FunctionNode): void;
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
 * Direct test-body ownership: the current function is a remembered `it` /
 * `test` callback, not a nested function sitting inside one.
 */
export function createDirectTestBody(): DirectTestBody {
	const testCallbacks = new WeakSet<FunctionNode>();
	const functionStack: FunctionNode[] = [];

	function enterFunction(node: FunctionNode): void {
		functionStack.push(node);
	}

	function exitFunction(node: FunctionNode): void {
		if (functionStack.at(-1) === node) {
			functionStack.pop();
		}
	}

	return {
		enterFunction,
		exitFunction,
		inDirectBody(): boolean {
			const current = functionStack.at(-1);
			return current !== undefined && testCallbacks.has(current);
		},
		note(node: ESTree.CallExpression): void {
			if (testFunctionName(node.callee) === null) {
				return;
			}

			const callback = testCallbackFromCall(node);
			if (callback !== null) {
				testCallbacks.add(callback);
			}
		},
		remember(callback: FunctionNode): void {
			testCallbacks.add(callback);
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
