import { unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import { bindingKind } from "./binding-kind";
import { visitIdentifier } from "./visit-identifier";
import { visitMemberTarget } from "./visit-member-target";
import type { Walker } from "./walker";

/**
 * An assignment target. Writing a member of the analyzed object is
 * recorded by key; writing anything not local to the member is a side
 * effect. A `compound` target (`+=`, `++`) is read first.
 */
export function visitTarget(walker: Walker, node: ESTree.Node, compound: boolean): void {
	const target = unwrapExpression(node);
	if (target.type === "MemberExpression") {
		visitMemberTarget(walker, target, compound);
	} else if (target.type === "Identifier") {
		if (compound) {
			visitIdentifier(walker, target);
		}

		walker.effects.sideEffects ||= bindingKind(walker.scope, target) !== "local";
	} else if (target.type === "AssignmentPattern") {
		visitTarget(walker, target.left, false);
		walker.visit(target.right, false);
	} else if (target.type === "ArrayPattern") {
		for (const element of target.elements) {
			if (element !== null) {
				visitTarget(walker, element, false);
			}
		}
	} else if (target.type === "ObjectPattern") {
		for (const property of target.properties) {
			if (property.type === "RestElement") {
				visitTarget(walker, property.argument, false);
				continue;
			}

			if (property.computed) {
				walker.visit(property.key, false);
			}

			visitTarget(walker, property.value, false);
		}
	} else if (target.type === "RestElement") {
		visitTarget(walker, target.argument, false);
	} else {
		walker.effects.opaque = true;
		walker.effects.sideEffects = true;
	}
}
