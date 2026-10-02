import type { ESTree, SourceCode } from "@oxlint/plugins";

import { ownedStart } from "./owned-start";
import { statementEnd } from "./statement-end";
import { stitch } from "./stitch";

/**
 * Rebuild the suite body by placing each direct child, with the comments on
 * the lines above it, in the given order. Whitespace between those pieces
 * stays where it is. Returns null when the edit would cut through a shared
 * line or a comment that is not clearly attached to one child.
 */
export function rewriteSuiteBody(
	source: string,
	sourceCode: SourceCode,
	block: ESTree.BlockStatement,
	ordered: readonly ESTree.Statement[]
): string | null {
	const interiorStart = block.range[0] + 1;
	const interiorEnd = block.range[1] - 1;
	const separators: string[] = [];
	const owned = new Map<ESTree.Statement, string>();
	let cursor = interiorStart;

	for (const statement of block.body) {
		const end = statementEnd(source, statement);
		if (end < 0) {
			return null;
		}

		let start = ownedStart(source, sourceCode, statement);
		if (start < cursor) {
			start = cursor;
		}

		if (start > statement.range[0] || end < start) {
			return null;
		}

		if (cursor !== interiorStart && !source.slice(cursor, statement.range[0]).includes("\n")) {
			return null;
		}

		const separator = source.slice(cursor, start);
		if (separator.trim() !== "") {
			return null;
		}

		separators.push(separator);
		owned.set(statement, source.slice(start, end));
		cursor = end;
	}

	const tail = source.slice(cursor, interiorEnd);
	if (tail.trim() !== "") {
		return null;
	}

	return stitch({ owned, separators, tail }, ordered);
}
