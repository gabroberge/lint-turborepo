import type { FunctionNode } from "@gabroberge/oxlint-estree";

import { block } from "./block";

export function arrow(body: object = block(), params: object[] = []): FunctionNode {
	return {
		async: false,
		body,
		expression: !("type" in body && body.type === "BlockStatement"),
		generator: false,
		params,
		type: "ArrowFunctionExpression"
	} as unknown as FunctionNode;
}
