import { isFunctionNode, unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import { isDirectEval } from "./is-direct-eval";
import { isNamedReference } from "./is-named-reference";
import { isSelf } from "./is-self";
import { visitMember } from "./visit-member";
import type { Walker } from "./walker";

/**
 * A call or `new`. A call assumed to be a factory (see `ClassAssumptions`)
 * is not an effect by itself, and functions passed to it are deferred; its
 * callee is still evaluated unless it is a plain name, so a factory reached
 * through a member (`this.lib.make()`) still reads that member. A call to a
 * member of the analyzed object runs that member's code. An immediately
 * invoked function literal runs code that is analyzed in place. A direct
 * `eval` can reach `this`, so it is opaque. Any other
 * callee is unknown code: a side effect, with every function argument run
 * right away.
 */
export function visitCall(walker: Walker, node: ESTree.CallExpression | ESTree.NewExpression): void {
	const { effects } = walker;
	const callee = unwrapExpression(node.callee);
	const insensitive = node.type === "CallExpression" && walker.scope.assumptions.assumeCall(node) !== null;

	if (insensitive) {
		if (!isNamedReference(walker, callee)) {
			walker.visit(callee, false);
		}
	} else if (node.type === "NewExpression") {
		walker.visit(callee, false);
		effects.sideEffects = true;
		effects.opaque ||= isSelf(walker, callee);
	} else if (callee.type === "MemberExpression") {
		visitMember(walker, callee, true);
	} else if (callee.type === "Super") {
		effects.opaque = true;
		effects.sideEffects = true;
	} else if (isDirectEval(walker, node, callee)) {
		effects.opaque = true;
		effects.sideEffects = true;
	} else if (isFunctionNode(callee)) {
		walker.visit(callee, false);
	} else {
		walker.visit(callee, false);
		effects.sideEffects = true;
	}

	for (const argument of node.arguments) {
		walker.visit(argument, insensitive);
	}
}
