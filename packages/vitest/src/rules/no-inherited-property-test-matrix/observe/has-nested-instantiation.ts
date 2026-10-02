import { type FunctionNode, isFunctionNode, traverse } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import { containsInstantiation } from "./contains-instantiation";

/** A nested helper that instantiates is not the test input. Other tests' callbacks are not helpers. */
export function hasNestedInstantiation(body: ESTree.Node, testCallbacks: WeakSet<FunctionNode>): boolean {
	let found = false;
	traverse(body, (node) => {
		if (found) {
			return "skip";
		}

		if (!isFunctionNode(node)) {
			return undefined;
		}

		if (!testCallbacks.has(node) && containsInstantiation(node)) {
			found = true;
		}

		return "skip";
	});
	return found;
}
