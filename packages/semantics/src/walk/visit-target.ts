import { unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import { resolveIdentifier } from "../resolve/resolve-identifier";
import { emitAccess } from "./emit-access";
import { emitUnknown } from "./emit-unknown";
import { visitMemberTarget } from "./visit-member-target";
import type { Walker } from "./walker";

/**
 * An assignment target. Members and outside bindings become write facts;
 * locals of the unit are not reported. A `compound` target (`+=`, `++`) is
 * read first. Destructuring targets are visited element by element.
 */
export function visitTarget(walker: Walker, node: ESTree.Node, compound: boolean): void {
	const target = unwrapExpression(node);
	if (target.type === "MemberExpression") {
		visitMemberTarget(walker, target, compound);
	} else if (target.type === "Identifier") {
		const resolution = resolveIdentifier(walker, target);
		if (resolution.kind === "local") {
			return;
		}

		if (compound) {
			emitAccess(walker, "read", resolution.target, target);
		}

		emitAccess(walker, "write", resolution.target, target);
	} else if (target.type === "AssignmentPattern") {
		visitTarget(walker, target.left, false);
		walker.visit(target.right, "run");
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
				walker.visit(property.key, "run");
			}

			visitTarget(walker, property.value, false);
		}
	} else if (target.type === "RestElement") {
		visitTarget(walker, target.argument, false);
	} else {
		emitUnknown(walker, "unsupported-target", target);
	}
}
