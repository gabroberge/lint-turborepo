import type { ESTree } from "@oxlint/plugins";

import { identifier } from "./identifier";

export function expectCall(): ESTree.CallExpression {
	return {
		arguments: [],
		callee: identifier("expect"),
		optional: false,
		type: "CallExpression"
	} as unknown as ESTree.CallExpression;
}
