import type { ESTree } from "@oxlint/plugins";

import type { UnknownReason } from "../model/fact";
import type { Walker } from "./walker";

/** Record that the unit's code does something the model cannot account for. */
export function emitUnknown(walker: Walker, reason: UnknownReason, node: ESTree.Node): void {
	walker.emit({ kind: "unknown", node, reason });
}
