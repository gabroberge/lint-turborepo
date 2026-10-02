import { startOf } from "@gabroberge/oxlint-estree";
import type { ESTree, SourceCode } from "@oxlint/plugins";

export function ownedStart(sourceCode: SourceCode, node: ESTree.MethodDefinition): number {
	const anchor = node.decorators[0] ?? node;
	const comments = sourceCode.getCommentsBefore(anchor);
	const leading = comments[0];
	if (comments.length === 0 || leading === undefined) {
		return startOf(anchor);
	}

	return startOf(leading);
}
