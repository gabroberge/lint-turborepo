import type { ESTree } from "@oxlint/plugins";

import type { CallAssumption } from "./call-assumption";

/**
 * Knowledge about code outside the module, supplied by a consumer (for
 * example, about a framework's APIs). Assumptions are trusted: a wrong
 * answer can hide real behaviour. Without them, every call into unknown code
 * is reported as uncertain.
 */
export interface Assumptions {
	/** What to assume about one call, or `null` to treat it as unknown code. */
	assumeCall: (call: ESTree.CallExpression) => CallAssumption | null;
}
