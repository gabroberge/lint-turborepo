import type { ESTree, SourceCode } from "@oxlint/plugins";

import { blankLinesInGap } from "./blank-lines-in-gap";
import type { Chunk } from "./chunk";
import { commentsBetween } from "./comments-between";
import { lineStart } from "./line-start";
import { sameLine } from "./same-line";
import { trailingComments } from "./trailing-comments";

/**
 * Splits a class body into one movable chunk per member, attaching the comments each member owns.
 * Returns `null` when the members cannot be safely moved as whole lines.
 */
export function memberChunks(sourceCode: SourceCode, body: ESTree.ClassBody): Chunk[] | null {
	const members = body.body;
	if (members.length === 0) {
		return [];
	}

	const source = sourceCode.text;
	const comments = sourceCode.getAllComments();
	const chunks: Chunk[] = [];
	let previousEnd = body.range[0] + 1;

	for (const [index, member] of members.entries()) {
		const [memberStart, memberEnd] = member.range;
		const before = commentsBetween(comments, previousEnd, memberStart);
		const leading =
			index === 0 ? before.filter((comment) => !sameLine(source, previousEnd, comment.range[0])) : before;
		const trailing = trailingComments(source, comments, memberEnd, nextBoundary(members, index, body));
		const start = leading[0]?.range[0] ?? memberStart;
		const end = trailing.at(-1)?.range[1] ?? memberEnd;
		const indent = source.slice(lineStart(source, start), start);
		if (indent.trim() !== "") {
			return null;
		}

		const gap = index === 0 ? "" : source.slice(previousEnd, start);
		if (gap.trim() !== "") {
			return null;
		}

		chunks.push({ blankLinesBefore: blankLinesInGap(gap), end, indent, start });
		previousEnd = end;
	}

	return chunks;
}

function nextBoundary(members: readonly ESTree.ClassElement[], index: number, body: ESTree.ClassBody): number {
	return members[index + 1]?.range[0] ?? body.range[1] - 1;
}
