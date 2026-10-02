import type { FunctionNode } from "@gabroberge/oxlint-estree";
import type { ESTree, VisitorWithHooks } from "@oxlint/plugins";

import { describeCallbackFromCall } from "../../../test-call";

interface ComparisonScope {
	enterFunction: (node: FunctionNode) => void;
	exitFunction: (node: FunctionNode) => void;
	isLaterCopy: (identity: string) => boolean;
	note: (node: ESTree.CallExpression) => void;
	rememberDescribe: (node: ESTree.CallExpression) => void;
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
 * Pairing memory for one file. Identities are compared inside the innermost
 * `describe` callback, or in the file when there is no `describe`. Sibling
 * describes do not share identities, even when their titles match.
 *
 * `isLaterCopy` records the identity. The first copy is kept; each later copy
 * in that same scope returns `true`.
 */
export function createComparisonScope(): ComparisonScope {
	const fileScope = {};
	const describeCallbacks = new WeakSet<FunctionNode>();
	const describeStack: FunctionNode[] = [];
	const seenByScope = new Map<object, Set<string>>();

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

	function note(node: ESTree.CallExpression): void {
		const callback = describeCallbackFromCall(node);
		if (callback !== null) {
			describeCallbacks.add(callback);
		}
	}

	return {
		enterFunction,
		exitFunction,
		isLaterCopy: (identity: string): boolean => {
			const scope = describeStack.at(-1) ?? fileScope;
			const seen = seenByScope.get(scope) ?? new Set<string>();

			seenByScope.set(scope, seen);
			if (seen.has(identity)) {
				return true;
			}

			seen.add(identity);
			return false;
		},
		note,
		rememberDescribe: note,
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
