import type { FunctionNode } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

export function describeCall(body: FunctionNode): ESTree.CallExpression {
	return {
		arguments: [{ type: "Literal", value: "Accounts" }, body],
		callee: { name: "describe", type: "Identifier" },
		optional: false,
		type: "CallExpression"
	} as unknown as ESTree.CallExpression;
}
