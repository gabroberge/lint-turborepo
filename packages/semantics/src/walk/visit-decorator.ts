import { unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import { emitUnknown } from "./emit-unknown";
import type { Walker } from "./walker";

/**
 * A decorator, part of a class's definition code. Its expression is
 * evaluated, then its result is called with the class or member it
 * decorates: code outside the model (`call`), unless the expression is a
 * call the assumptions describe. A class decorator also hands the class
 * itself to that code (`receiver-escape`).
 */
export function visitDecorator(walker: Walker, node: ESTree.Decorator): void {
	walker.visit(node.expression, "run");
	const expression = unwrapExpression(node.expression);
	if (expression.type === "CallExpression" && walker.draft.assumptions.assumeCall(expression) !== null) {
		return;
	}

	emitUnknown(walker, "call", node);
	const { parent } = node;
	if (parent.type === "ClassDeclaration" || parent.type === "ClassExpression") {
		emitUnknown(walker, "receiver-escape", node);
	}
}
