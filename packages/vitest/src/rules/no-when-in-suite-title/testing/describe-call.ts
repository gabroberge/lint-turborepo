import type { FunctionNode } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import { arrowFunction } from "./arrow-function";

export function describeCall(body: FunctionNode = arrowFunction()): ESTree.CallExpression {
	return {
		arguments: [{ type: "Literal", value: "Accounts" }, body],
		callee: { name: "describe", type: "Identifier" },
		optional: false,
		type: "CallExpression"
	} as unknown as ESTree.CallExpression;
}
