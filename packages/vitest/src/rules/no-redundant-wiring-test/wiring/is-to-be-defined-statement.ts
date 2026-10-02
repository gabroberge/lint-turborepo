import type { ESTree } from "@oxlint/plugins";

import { isToBeDefinedAssertion } from "./is-to-be-defined-assertion";

/**
 * A statement that is only `expect(value).toBeDefined()`.
 */
export function isToBeDefinedStatement(statement: ESTree.Statement): boolean {
	return statement.type === "ExpressionStatement" && isToBeDefinedAssertion(statement.expression);
}
