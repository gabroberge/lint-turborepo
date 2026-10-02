import type { ESTree } from "@oxlint/plugins";

import type { CallAssumption } from "./call-assumption";

/**
 * Knowledge about outside code that a caller supplies to the analysis,
 * typically about a framework's APIs. Without it, every call is unknown code
 * that may have any side effect and may run its function arguments at once.
 */
export interface ClassAssumptions {
	/** What to assume about one call, or `null` to treat it as unknown code. */
	assumeCall: (call: ESTree.CallExpression) => CallAssumption | null;
}
