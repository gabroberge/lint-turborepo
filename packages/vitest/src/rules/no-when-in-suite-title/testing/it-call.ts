import type { ESTree } from "@oxlint/plugins";

import { arrowFunction } from "./arrow-function";

export function itCall(): ESTree.CallExpression {
	return {
		arguments: [{ type: "Literal", value: "returns the account" }, arrowFunction()],
		callee: { name: "it", type: "Identifier" },
		optional: false,
		type: "CallExpression"
	} as unknown as ESTree.CallExpression;
}
