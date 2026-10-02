import { unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import { accessKey } from "./access-key";
import { isSelf } from "./is-self";
import { useMember } from "./use-member";
import type { Walker } from "./walker";
import { writeMember } from "./write-member";

/**
 * A member access assigned to. A member of the analyzed object is written by
 * key (read first when `compound`); a property of any other object is a side
 * effect.
 */
export function visitMemberTarget(walker: Walker, target: ESTree.MemberExpression, compound: boolean): void {
	const object = unwrapExpression(target.object);
	if (isSelf(walker, object)) {
		const key = accessKey(target);
		if (compound) {
			useMember(walker, key, false);
		}

		writeMember(walker, key);
		return;
	}

	walker.visit(object, false);
	if (target.computed) {
		walker.visit(target.property, false);
	}

	walker.effects.sideEffects = true;
}
