import { unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import type { AccessMode } from "../model/fact";
import { memberTarget } from "../resolve/member-target";
import { resolveObject } from "../resolve/resolve-object";
import { accessKey } from "./access-key";
import { emitAccess } from "./emit-access";
import { emitUnknown } from "./emit-unknown";
import { isFollowableMember } from "./is-followable-member";
import type { Walker } from "./walker";

/**
 * A member access, read for its value or called. A member of a module class
 * (through `this` or the class name) becomes a member fact; a dynamic key on
 * it is uncertain, and so is calling a member the model cannot follow (see
 * `isFollowableMember`). Any other object's property is a property fact, and
 * calling one runs code the model cannot see. Module-level `this` is
 * `undefined`: accessing it reaches nothing.
 */
export function visitMember(walker: Walker, node: ESTree.MemberExpression, mode: Exclude<AccessMode, "write">): void {
	const object = unwrapExpression(node.object);
	if (object.type === "Super") {
		visitComputedKey(walker, node);
		emitUnknown(walker, "super", node);
		return;
	}

	const resolution = resolveObject(walker, object);
	const key = accessKey(node);
	if (resolution.kind === "no-receiver") {
		visitComputedKey(walker, node);
		return;
	}

	if (resolution.kind === "unknown-receiver") {
		visitComputedKey(walker, node);
		emitUnknown(walker, "unknown-receiver", node);
		if (mode === "call") {
			emitUnknown(walker, "call", node);
		}

		return;
	}

	if (resolution.kind === "class-member") {
		if (key === null) {
			visitComputedKey(walker, node);
			emitUnknown(walker, "dynamic-member", node);
			return;
		}

		const target = memberTarget(walker.draft, resolution.class, key, resolution.static, mode);
		emitAccess(walker, mode, target, node);
		if (mode === "call" && !isFollowableMember(walker.draft, target)) {
			emitUnknown(walker, "call", node);
		}

		return;
	}

	walker.visit(object, "run");
	visitComputedKey(walker, node);
	emitAccess(walker, mode, { kind: "property", name: key?.name ?? null }, node);
	if (mode === "call") {
		emitUnknown(walker, "call", node);
	}
}

function visitComputedKey(walker: Walker, node: ESTree.MemberExpression): void {
	if (node.computed) {
		walker.visit(node.property, "run");
	}
}
