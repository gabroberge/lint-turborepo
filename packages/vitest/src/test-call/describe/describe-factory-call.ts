import type { ESTree } from "@oxlint/plugins";

import { isFactoryModifier } from "../callee/is-factory-modifier";
import { describeFunctionName } from "./describe-function-name";

/**
 * `describe.skipIf(condition)`, `describe.runIf(condition)`, `describe.each(table)`,
 * and `describe.for(cases)` return the function that receives the suite title.
 * Their own first argument is not a suite body.
 */
export function isDescribeFactoryCall(node: ESTree.CallExpression): boolean {
	return isFactoryModifier(node.callee) && describeFunctionName(node.callee) !== null;
}
