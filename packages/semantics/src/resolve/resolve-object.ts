import { unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import type { Walker } from "../walk/walker";
import type { ObjectResolution } from "./object-resolution";
import { resolveIdentifier } from "./resolve-identifier";

/**
 * Resolve the object of a member access: `this` through the unit's
 * receiver, a module class's name to its static side, anything else as a
 * foreign object.
 */
export function resolveObject(walker: Walker, object: ESTree.Node): ObjectResolution {
	const node = unwrapExpression(object);
	if (node.type === "ThisExpression") {
		const { receiver } = walker.unit;
		if (receiver.kind === "instance" || receiver.kind === "class") {
			return { class: receiver.class, kind: "class-member", static: receiver.kind === "class" };
		}

		return { kind: "unknown-receiver" };
	}

	if (node.type === "Identifier") {
		const resolution = resolveIdentifier(walker, node);
		if (resolution.kind === "class") {
			return { class: resolution.class, kind: "class-member", static: true };
		}
	}

	return { kind: "foreign" };
}
