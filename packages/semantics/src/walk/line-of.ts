import type { Ranged } from "@gabroberge/oxlint-estree";
import type { SourceCode } from "@oxlint/plugins";

/** The 1-based line a node starts on. */
export function lineOf(sourceCode: SourceCode, node: Ranged): number {
	return sourceCode.getLocFromIndex(node.range[0]).line;
}
