import type { ESTree } from "@oxlint/plugins";

import { isFactoryModifier } from "../callee/is-factory-modifier";
import { testFunctionName } from "./test-function-name";

/**
 * `it.skipIf(condition)`, `it.runIf(condition)`, `it.each(table)`, and `it.for(cases)`
 * return the function that actually receives the title. Their own first argument
 * is not a title.
 */
export function isTestFactoryCall(node: ESTree.CallExpression): boolean {
	return isFactoryModifier(node.callee) && testFunctionName(node.callee) !== null;
}
