import type { ESTree } from "@oxlint/plugins";

import { unwrapCallee } from "../callee/unwrap-callee";

export function describeFunctionName(callee: ESTree.Node): "describe" | null {
	const current = unwrapCallee(callee);

	if (current.type === "Identifier" && current.name === "describe") {
		return "describe";
	}

	return null;
}
