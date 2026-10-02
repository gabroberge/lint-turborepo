import type { ESTree } from "@oxlint/plugins";

import type { AnalyzedMember } from "../index";

/** An analyzed member without a real node, for units that only read its metadata. */
export function memberStub(overrides: Partial<AnalyzedMember> = {}): AnalyzedMember {
	return {
		index: 0,
		key: "member",
		node: { type: "PropertyDefinition" } as unknown as ESTree.ClassElement,
		overload: false,
		static: false,
		timeline: "instance",
		visibility: "public",
		...overrides
	};
}
