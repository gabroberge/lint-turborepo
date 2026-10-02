import type { ESTree } from "@oxlint/plugins";

import { identifier } from "./identifier";

export function testCallWithArgument(argument: object): ESTree.CallExpression {
	return {
		arguments: [{ type: "Literal", value: "title" }, argument],
		callee: identifier("it"),
		optional: false,
		type: "CallExpression"
	} as unknown as ESTree.CallExpression;
}
