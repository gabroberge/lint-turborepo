import type { ESTree } from "@oxlint/plugins";

import { emitUnknown } from "./emit-unknown";
import type { Walker } from "./walker";

/** A bare `this` used as a value: the receiver escapes, or is unknown. */
export function visitThis(walker: Walker, node: ESTree.ThisExpression): void {
	const { kind } = walker.unit.receiver;
	emitUnknown(walker, kind === "instance" || kind === "class" ? "receiver-escape" : "unknown-receiver", node);
}
