import type { ESTree } from "@oxlint/plugins";

interface MethodDefinitionFlags {
	computed?: boolean;
	key: ESTree.Expression;
	kind?: ESTree.MethodDefinitionKind;
	static?: boolean;
}

export function methodDefinition(flags: MethodDefinitionFlags): ESTree.MethodDefinition {
	return {
		computed: flags.computed ?? false,
		key: flags.key,
		kind: flags.kind ?? "method",
		static: flags.static ?? false,
		type: "MethodDefinition"
	} as unknown as ESTree.MethodDefinition;
}
