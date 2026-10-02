import type { ESTree } from "@oxlint/plugins";

import { callsInChain } from "../chain/calls-in-chain";
import { isArrangeCall } from "./is-arrange-call";

/** Mock configuration or `vi.fn` / `jest.fn` in the chain. Bare `spyOn` is separate. */
export function isArrangeExpression(expression: ESTree.Expression): boolean {
	return callsInChain(expression).some(isArrangeCall);
}
