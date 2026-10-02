import { typeReferenceName } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

/** The identifier named by a field's type annotation, when it is a type reference. */
export function fieldTypeName(node: ESTree.PropertyDefinition): string | null {
	const annotation = node.typeAnnotation;
	if (annotation == null) {
		return null;
	}

	return typeReferenceName(annotation.typeAnnotation);
}
