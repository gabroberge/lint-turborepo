import type { ESTree } from "@oxlint/plugins";

import { call } from "./call";
import { identifier } from "./identifier";

export function identifierCall(name: string): ESTree.CallExpression {
	return call(identifier(name), []);
}
