import type { ESTree } from "@oxlint/plugins";

import { call } from "./call";
import { identifier } from "./identifier";

export function expectCall(value: object = identifier("worker")): ESTree.CallExpression {
	return call(identifier("expect"), [value]);
}
