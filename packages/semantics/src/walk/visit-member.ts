import { unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import { accessKey } from "./access-key";
import { isSelf } from "./is-self";
import { useMember } from "./use-member";
import type { Walker } from "./walker";

/** A member access, evaluated for its value, or as a callee when `invoked`. */
export function visitMember(walker: Walker, node: ESTree.MemberExpression, invoked: boolean): void {
	const { effects } = walker;
	const object = unwrapExpression(node.object);
	if (isSelf(walker, object)) {
		useMember(walker, accessKey(node), invoked);
		return;
	}

	if (object.type === "Super") {
		effects.opaque = true;
		effects.sideEffects = true;
		return;
	}

	walker.visit(object, false);
	if (node.computed) {
		walker.visit(node.property, false);
	}

	effects.external = true;
	effects.sideEffects ||= invoked;
}
