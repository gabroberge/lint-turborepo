import type { ESTree } from "@oxlint/plugins";

import { emitUnknown } from "./emit-unknown";
import type { Walker } from "./walker";

/**
 * A bare `this` used as a value: the receiver escapes, or is unknown.
 * Module-level `this` (in module code, class definition code and the arrows
 * in them) is `undefined` and reports nothing.
 */
export function visitThis(walker: Walker, node: ESTree.ThisExpression): void {
	const { kind } = walker.unit.receiver;
	if (kind === "none") {
		return;
	}

	emitUnknown(walker, kind === "instance" || kind === "class" ? "receiver-escape" : "unknown-receiver", node);
}
