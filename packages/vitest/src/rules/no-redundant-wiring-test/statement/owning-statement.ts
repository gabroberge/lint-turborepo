import type { ESTree, VisitorWithHooks } from "@oxlint/plugins";

import { ownsCall } from "./owns-call";

export interface OwningStatement {
	of: (call: ESTree.CallExpression) => ESTree.ExpressionStatement | null;
	visitors: Pick<VisitorWithHooks, "ExpressionStatement:exit" | "ExpressionStatement">;
}

/**
 * Whether a `CallExpression` is the whole `ExpressionStatement` that contains
 * it. Owns the statement stack and the enter/exit visitors that keep it current.
 */
export function createOwningStatement(): OwningStatement {
	const stack: ESTree.ExpressionStatement[] = [];

	function enter(node: ESTree.ExpressionStatement): void {
		stack.push(node);
	}

	function exit(node: ESTree.ExpressionStatement): void {
		if (stack.at(-1) === node) {
			stack.pop();
		}
	}

	return {
		of: (call: ESTree.CallExpression): ESTree.ExpressionStatement | null => {
			const statement = stack.at(-1);
			if (statement !== undefined && ownsCall(statement, call)) {
				return statement;
			}

			return null;
		},
		visitors: {
			ExpressionStatement: enter,
			"ExpressionStatement:exit": exit
		}
	};
}
