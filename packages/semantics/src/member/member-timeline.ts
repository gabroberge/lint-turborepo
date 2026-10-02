import type { ESTree } from "@oxlint/plugins";

import type { Timeline } from "./timeline";

/**
 * The timeline a member's initialization code runs in, or `null` when it
 * runs none: methods, accessors, constructors, index signatures, abstract
 * and `declare` fields.
 */
export function memberTimeline(node: ESTree.ClassElement): Timeline | null {
	switch (node.type) {
		case "AccessorProperty":
		case "PropertyDefinition": {
			if (node.declare === true) {
				return null;
			}

			return node.static ? "static" : "instance";
		}
		case "MethodDefinition":
		case "TSAbstractAccessorProperty":
		case "TSAbstractMethodDefinition":
		case "TSAbstractPropertyDefinition":
		case "TSIndexSignature": {
			return null;
		}
		case "StaticBlock": {
			return "static";
		}
	}
}
