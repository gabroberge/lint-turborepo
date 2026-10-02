import { unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import { memberTarget } from "../resolve/member-target";
import { resolveObject } from "../resolve/resolve-object";
import { accessKey } from "./access-key";
import { emitAccess } from "./emit-access";
import { emitUnknown } from "./emit-unknown";
import type { Walker } from "./walker";

/** A member assigned to (and read first when `compound`). */
export function visitMemberTarget(walker: Walker, node: ESTree.MemberExpression, compound: boolean): void {
	const object = unwrapExpression(node.object);
	if (node.computed) {
		walker.visit(node.property, "run");
	}

	if (object.type === "Super") {
		emitUnknown(walker, "super", node);
		return;
	}

	const resolution = resolveObject(walker, object);
	const key = accessKey(node);
	if (resolution.kind === "no-receiver") {
		// Module-level `this` is `undefined`: the assignment throws before touching anything.
		return;
	}

	if (resolution.kind === "unknown-receiver") {
		emitUnknown(walker, "unknown-receiver", node);
		return;
	}

	if (resolution.kind === "class-member") {
		if (key === null) {
			emitUnknown(walker, "dynamic-member", node);
			return;
		}

		if (compound) {
			emitAccess(
				walker,
				"read",
				memberTarget(walker.draft, resolution.class, key, resolution.static, "read"),
				node
			);
		}

		emitAccess(
			walker,
			"write",
			memberTarget(walker.draft, resolution.class, key, resolution.static, "write"),
			node
		);
		return;
	}

	walker.visit(object, "run");
	const target = { kind: "property", name: key?.name ?? null } as const;
	if (compound) {
		emitAccess(walker, "read", target, node);
	}

	emitAccess(walker, "write", target, node);
}
