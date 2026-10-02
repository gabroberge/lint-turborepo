import type { FunctionNode } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

export function itCall(body: FunctionNode): ESTree.CallExpression {
	return {
		arguments: [{ type: "Literal", value: "returns the account" }, body],
		callee: { name: "it", type: "Identifier" },
		optional: false,
		type: "CallExpression"
	} as unknown as ESTree.CallExpression;
}
