import { type FunctionNode, isFunctionNode, traverse } from "@gabroberge/oxlint-estree";

import { isExpectCall } from "./is-expect-call";

/**
 * True when an `expect` call sits in this function itself.
 * Ordinary control flow (`if`, loops, `try`, blocks) counts. A nested
 * function does not, whether or not that function is called.
 */
export function expectInOwnBody(callback: FunctionNode): boolean {
	let found = false;

	traverse(callback, (node) => {
		if (found) {
			return "skip";
		}

		if (node !== callback && isFunctionNode(node)) {
			return "skip";
		}

		if (node.type === "CallExpression" && isExpectCall(node)) {
			found = true;
			return "skip";
		}

		return undefined;
	});

	return found;
}
