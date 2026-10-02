import type { FunctionNode } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import { call } from "./call";
import { identifier } from "./identifier";
import { title } from "./title";

export function describeCall(body: FunctionNode): ESTree.CallExpression {
	return call(identifier("describe"), [title("Worker"), body]);
}
