import type { FunctionNode } from "@gabroberge/oxlint-estree";
import type { ESTree, VisitorWithHooks } from "@oxlint/plugins";

import { isBeforeEachCall } from "./is-before-each-call";
import { writtenCallbackFromCall } from "./written-callback-from-call";

export interface BeforeEachOwnership {
	enterFunction: (node: FunctionNode) => void;
	exitFunction: (node: FunctionNode) => void;
	inDirectBeforeEach: () => boolean;
	mark: (callback: FunctionNode) => void;
	note: (node: ESTree.CallExpression) => void;
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
 * Direct `beforeEach` ownership: the current function is a marked callback,
 * not a nested function sitting inside one.
 */
export function createBeforeEachOwnership(): BeforeEachOwnership {
	const callbacks = new WeakSet<FunctionNode>();
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
		inDirectBeforeEach: (): boolean => {
			const current = functionStack.at(-1);
			return current !== undefined && callbacks.has(current);
		},
		mark: (callback: FunctionNode): void => {
			callbacks.add(callback);
		},
		note: (node: ESTree.CallExpression): void => {
			if (!isBeforeEachCall(node)) {
				return;
			}

			const callback = writtenCallbackFromCall(node);
			if (callback !== null) {
				callbacks.add(callback);
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
