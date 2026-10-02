import type { ESTree } from "@oxlint/plugins";

import { arrow } from "./arrow";
import { block } from "./block";
import { identifier } from "./identifier";

export function unknownCall(): ESTree.CallExpression {
	return {
		arguments: [arrow(block())],
		callee: identifier("describe"),
		optional: false,
		type: "CallExpression"
	} as unknown as ESTree.CallExpression;
}
