import { typeReferenceName } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

/** The identifier named by a binding's type annotation, when it is a type reference. */
export function annotationName(id: ESTree.BindingIdentifier): string | null {
	const annotation = id.typeAnnotation;
	if (annotation == null) {
		return null;
	}

	return typeReferenceName(annotation.typeAnnotation);
}
