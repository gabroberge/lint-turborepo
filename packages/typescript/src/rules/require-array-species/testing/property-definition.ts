import type { ESTree } from "@oxlint/plugins";

interface PropertyDefinitionFlags {
	computed?: boolean;
	key: ESTree.Expression;
	static?: boolean;
}

export function propertyDefinition(flags: PropertyDefinitionFlags): ESTree.PropertyDefinition {
	return {
		computed: flags.computed ?? false,
		key: flags.key,
		static: flags.static ?? false,
		type: "PropertyDefinition"
	} as unknown as ESTree.PropertyDefinition;
}
