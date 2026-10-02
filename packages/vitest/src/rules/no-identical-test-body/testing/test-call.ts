import type { FunctionNode } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import { testCallee } from "./test-callee";

export function testCall(name: "it" | "test", callback?: FunctionNode, modifier?: string): ESTree.CallExpression {
	const args: object[] = [{ type: "Literal", value: "title" }];
	if (callback !== undefined) {
		args.push(callback);
	}

	return {
		arguments: args,
		callee: testCallee(name, modifier),
		optional: false,
		type: "CallExpression"
	} as unknown as ESTree.CallExpression;
}
