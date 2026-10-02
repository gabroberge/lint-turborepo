import type { FunctionNode } from "@gabroberge/oxlint-estree";
import type { ESTree, VisitorWithHooks } from "@oxlint/plugins";

import { describeCallbackFromCall } from "../../../test-call";

export interface OutermostSuite {
	enterFunction: (node: FunctionNode) => void;
	exitFunction: (node: FunctionNode) => void;
	note: (node: ESTree.CallExpression) => void;
	outermost: () => FunctionNode | null;
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
 * The suite is the outermost `describe` callback. Nested describes stay in
 * that suite. A function that is not a describe callback does not change it.
 * A separate top-level describe is a different suite.
 *
 * Owns the callback set, the stack, and the function-enter/exit visitors.
 * Call `note` for every `CallExpression` so the current outermost stays current.
 */
export function createOutermostSuite(): OutermostSuite {
	const callbacks = new WeakSet<FunctionNode>();
	const stack: FunctionNode[] = [];

	function enterFunction(node: FunctionNode): void {
		if (callbacks.has(node)) {
			stack.push(node);
		}
	}

	function exitFunction(node: FunctionNode): void {
		if (stack.at(-1) === node) {
			stack.pop();
		}
	}

	function note(node: ESTree.CallExpression): void {
		const callback = describeCallbackFromCall(node);
		if (callback !== null) {
			callbacks.add(callback);
		}
	}

	return {
		enterFunction,
		exitFunction,
		note,
		outermost: (): FunctionNode | null => {
			return stack[0] ?? null;
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
