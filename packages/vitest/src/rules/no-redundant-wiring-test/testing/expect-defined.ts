import type { ESTree } from "@oxlint/plugins";

import { call } from "./call";
import { expectCall } from "./expect-call";
import { identifier } from "./identifier";
import { member } from "./member";

export function expectDefined(value: object = identifier("worker")): ESTree.CallExpression {
	return call(member(expectCall(value), "toBeDefined"), []);
}
