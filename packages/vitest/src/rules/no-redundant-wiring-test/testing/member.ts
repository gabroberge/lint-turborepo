import type { ESTree } from "@oxlint/plugins";

import { identifier } from "./identifier";

interface MemberFlags {
	computed?: boolean;
	optional?: boolean;
}

export function member(object: object, property: string, flags: MemberFlags = {}): ESTree.MemberExpression {
	return {
		computed: flags.computed ?? false,
		object,
		optional: flags.optional ?? false,
		property: identifier(property),
		type: "MemberExpression"
	} as unknown as ESTree.MemberExpression;
}
