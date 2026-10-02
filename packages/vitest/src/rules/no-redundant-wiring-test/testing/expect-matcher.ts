import type { ESTree } from "@oxlint/plugins";

import { call } from "./call";
import { expectCall } from "./expect-call";
import { identifier } from "./identifier";
import { member } from "./member";

export function expectMatcher(name: string): ESTree.CallExpression {
	return call(member(expectCall(), name), [identifier("worker")]);
}
