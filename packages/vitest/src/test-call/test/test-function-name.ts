import type { ESTree } from "@oxlint/plugins";

import { unwrapCallee } from "../callee/unwrap-callee";

export function testFunctionName(callee: ESTree.Node): "it" | "test" | null {
	const current = unwrapCallee(callee);

	if (current.type === "Identifier" && (current.name === "it" || current.name === "test")) {
		return current.name;
	}

	return null;
}
