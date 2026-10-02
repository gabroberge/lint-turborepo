import type { ESTree } from "@oxlint/plugins";

interface PropertyDefinitionFlags {
	accessibility?: ESTree.TSAccessibility | null;
	key?: ESTree.Expression;
	readonly?: boolean;
	typeAnnotation?: ESTree.TSTypeAnnotation | null;
	value?: ESTree.Expression | null;
}

export function propertyDefinition(flags: PropertyDefinitionFlags = {}): ESTree.PropertyDefinition {
	return {
		accessibility: flags.accessibility,
		computed: false,
		decorators: [],
		key: flags.key ?? { name: "field", type: "Identifier" },
		readonly: flags.readonly,
		static: false,
		type: "PropertyDefinition",
		typeAnnotation: flags.typeAnnotation,
		value: flags.value ?? null
	} as unknown as ESTree.PropertyDefinition;
}
