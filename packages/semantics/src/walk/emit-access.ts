import type { ESTree } from "@oxlint/plugins";

import type { AccessMode } from "../model/fact";
import type { AccessTarget } from "../model/target";
import type { Walker } from "./walker";

/** Record that the unit's code touches `target` in the given mode. */
export function emitAccess(walker: Walker, mode: AccessMode, target: AccessTarget, node: ESTree.Node): void {
	walker.emit({ kind: "access", mode, node, target });
}
