import { unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import { memberTarget } from "../resolve/member-target";
import { resolveIdentifier } from "../resolve/resolve-identifier";
import { resolveObject } from "../resolve/resolve-object";
import { accessKey } from "./access-key";
import type { Walker } from "./walker";

/**
 * The value assigned to `left`. A function literal assigned to a member of
 * a module class (other than through a setter, which receives it as an
 * argument) or to a module or closure binding is `stored`, owned by the
 * member or module declaration when known. One assigned to a local of the
 * unit is `bound-locally`. Anything else (a property of another object, a
 * global, a destructuring pattern) may hand it to code that calls it.
 */
export function visitAssignedValue(walker: Walker, left: ESTree.Node, right: ESTree.Expression): void {
	const target = unwrapExpression(left);
	if (target.type === "MemberExpression" && target.object.type !== "Super") {
		const resolution = resolveObject(walker, target.object);
		const key = accessKey(target);
		if (resolution.kind === "class-member") {
			const member =
				key === null
					? null
					: memberTarget(walker.draft, resolution.class, key, resolution.static, "write").member;
			if (member === null || walker.draft.declarations.get(member)?.kind !== "setter") {
				walker.withStoreOwner(member).visit(right, "store");
				return;
			}
		}
	} else if (target.type === "Identifier") {
		const resolution = resolveIdentifier(walker, target);
		if (resolution.kind === "local") {
			walker.visit(right, "local");
			return;
		}

		const { declaration, scope } = resolution.target;
		if (scope === "module" || scope === "closure") {
			walker.withStoreOwner(scope === "module" ? declaration : null).visit(right, "store");
			return;
		}
	}

	walker.visit(right, "run");
}
