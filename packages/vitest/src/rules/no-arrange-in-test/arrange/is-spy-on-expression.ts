import type { ESTree } from "@oxlint/plugins";

import { isSpyOnCall } from "../call/is-spy-on-call";
import { callsInChain } from "../chain/calls-in-chain";

export function isSpyOnExpression(expression: ESTree.Expression): boolean {
	return callsInChain(expression).some(isSpyOnCall);
}
