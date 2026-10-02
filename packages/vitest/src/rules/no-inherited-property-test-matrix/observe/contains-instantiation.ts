import { traverse } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import { isInstantiation } from "./is-instantiation";

export function containsInstantiation(node: ESTree.Node): boolean {
	let found = false;
	traverse(node, (current) => {
		if (found) {
			return "skip";
		}

		if (current.type === "CallExpression" && isInstantiation(current)) {
			found = true;
			return "skip";
		}

		return undefined;
	});
	return found;
}
