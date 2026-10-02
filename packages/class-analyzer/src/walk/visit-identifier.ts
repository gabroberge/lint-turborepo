import type { IdentifierNode } from "@gabroberge/oxlint-estree";

import { bindingKind } from "./binding-kind";
import { isSelf } from "./is-self";
import { markOpaque } from "./mark-opaque";
import type { Walker } from "./walker";

/**
 * An identifier read for its value. The class's own name in static code is
 * the class object escaping, like a bare `this`.
 */
export function visitIdentifier(walker: Walker, node: IdentifierNode): void {
	if (isSelf(walker, node)) {
		markOpaque(walker);
	} else if (bindingKind(walker.scope, node) === "mutable") {
		walker.effects.external = true;
	}
}
