import type { ESTree, SourceCode } from "@oxlint/plugins";

import type { Category } from "../options/categories";
import { fieldCategory } from "./field-category";
import { LIFECYCLE_HOOKS } from "./lifecycle-hooks";

/** The category a class element sorts under. */
export function memberCategory(sourceCode: SourceCode, node: ESTree.ClassElement, key: string | null): Category {
	switch (node.type) {
		case "AccessorProperty":
		case "PropertyDefinition":
		case "TSAbstractAccessorProperty":
		case "TSAbstractPropertyDefinition": {
			if (node.static) {
				return "static-property";
			}

			return fieldCategory(sourceCode, node.value);
		}
		case "MethodDefinition":
		case "TSAbstractMethodDefinition": {
			if (node.kind === "constructor") {
				return "constructor";
			}

			if (node.static) {
				return "static-method";
			}

			const lifecycle = node.kind === "method" && key !== null && LIFECYCLE_HOOKS.has(key);
			return lifecycle ? "lifecycle" : "method";
		}
		case "StaticBlock": {
			return "static-block";
		}
		case "TSIndexSignature": {
			return "index-signature";
		}
	}
}
