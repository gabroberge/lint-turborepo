import type { ESTree } from "@oxlint/plugins";

import type { ClassMember } from "../member/class-member";

/** A class member without a real node, for units that only read its metadata. */
export function memberStub(overrides: Partial<ClassMember> = {}): ClassMember {
	const key = overrides.key === undefined ? "member" : overrides.key;
	return {
		category: "property",
		index: 0,
		key,
		label: key ?? "[computed]",
		node: { type: "PropertyDefinition" } as unknown as ESTree.ClassElement,
		overload: false,
		static: false,
		timeline: "instance",
		visibility: "public",
		...overrides
	};
}
