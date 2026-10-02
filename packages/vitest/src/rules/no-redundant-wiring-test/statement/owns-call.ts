import { unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

/**
 * Whether this call is the whole expression of the statement.
 */
export function ownsCall(statement: ESTree.ExpressionStatement, call: ESTree.CallExpression): boolean {
	return unwrapExpression(statement.expression) === call;
}
