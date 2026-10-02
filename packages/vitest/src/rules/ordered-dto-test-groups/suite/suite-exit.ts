import type { FunctionNode } from "@gabroberge/oxlint-estree";
import type { ESTree, VisitorWithHooks } from "@oxlint/plugins";

import { describeCallbackFromCall } from "../../../test-call";

export interface SuiteExit {
	enterFunction(node: FunctionNode): void;
	exitFunction(node: FunctionNode): void;
	note(node: ESTree.CallExpression): void;
	visitors: Pick<
		VisitorWithHooks,
		| "ArrowFunctionExpression:exit"
		| "ArrowFunctionExpression"
		| "CallExpression"
		| "FunctionDeclaration:exit"
		| "FunctionDeclaration"
		| "FunctionExpression:exit"
		| "FunctionExpression"
	>;
}

/**
 * Walk `describe` callbacks and notify when the outermost suite exits.
 * Owns the callback-to-call map, the describe stack, and the visitors that
 * keep them current. Nested describes stay on the stack so only the suite
 * is reported.
 */
export function createSuiteExit(onExit: (call: ESTree.CallExpression, callback: FunctionNode) => void): SuiteExit {
	const describeCalls = new WeakMap<FunctionNode, ESTree.CallExpression>();
	const describeStack: FunctionNode[] = [];

	function enterFunction(node: FunctionNode): void {
		if (describeCalls.has(node)) {
			describeStack.push(node);
		}
	}

	function exitFunction(node: FunctionNode): void {
		if (describeStack.at(-1) !== node) {
			return;
		}

		if (describeStack.length === 1) {
			const call = describeCalls.get(node);
			if (call !== undefined) {
				onExit(call, node);
			}
		}

		describeStack.pop();
	}

	function note(node: ESTree.CallExpression): void {
		const callback = describeCallbackFromCall(node);
		if (callback !== null) {
			describeCalls.set(callback, node);
		}
	}

	return {
		enterFunction,
		exitFunction,
		note,
		visitors: {
			ArrowFunctionExpression: enterFunction,
			"ArrowFunctionExpression:exit": exitFunction,
			CallExpression: note,
			FunctionDeclaration: enterFunction,
			"FunctionDeclaration:exit": exitFunction,
			FunctionExpression: enterFunction,
			"FunctionExpression:exit": exitFunction
		}
	};
}
