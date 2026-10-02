import type { ESTree } from "@oxlint/plugins";

import { FACTORY_MODIFIERS } from "./factory-modifiers";

export function isFactoryModifier(callee: ESTree.Node): boolean {
	return (
		callee.type === "MemberExpression" &&
		!callee.computed &&
		callee.property.type === "Identifier" &&
		FACTORY_MODIFIERS.has(callee.property.name)
	);
}
