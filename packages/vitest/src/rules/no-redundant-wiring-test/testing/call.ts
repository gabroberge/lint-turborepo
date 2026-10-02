import type { ESTree } from "@oxlint/plugins";

interface CallFlags {
	optional?: boolean;
}

export function call(callee: object, args: object[], flags: CallFlags = {}): ESTree.CallExpression {
	return {
		arguments: args,
		callee,
		optional: flags.optional ?? false,
		type: "CallExpression"
	} as unknown as ESTree.CallExpression;
}
