import type { ESTree } from "@oxlint/plugins";

export function computedStaticKey(node: ESTree.ClassElement): ESTree.Node | null {
	switch (node.type) {
		case "AccessorProperty":
		case "MethodDefinition":
		case "PropertyDefinition":
		case "TSAbstractAccessorProperty":
		case "TSAbstractMethodDefinition":
		case "TSAbstractPropertyDefinition": {
			if (node.static && node.computed) {
				return node.key;
			}

			return null;
		}
		case "StaticBlock":
		case "TSIndexSignature": {
			return null;
		}
	}
}
