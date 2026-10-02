import type { ESTree } from "@oxlint/plugins";

export interface SuiteBodyPieces {
	owned: ReadonlyMap<ESTree.Statement, string>;
	separators: readonly string[];
	tail: string;
}

/**
 * Rebuild the suite interior by pairing each separator with the owned text of
 * the statement in `ordered`. Returns null when a piece is missing.
 */
export function stitch(pieces: SuiteBodyPieces, ordered: readonly ESTree.Statement[]): string | null {
	let text = "";
	for (let index = 0; index < pieces.separators.length; index++) {
		const separator = pieces.separators[index];
		if (separator === undefined) {
			return null;
		}

		const statement = ordered[index];
		if (statement === undefined) {
			return null;
		}

		const owned = pieces.owned.get(statement);
		if (owned === undefined) {
			return null;
		}

		text += separator + owned;
	}
	return text + pieces.tail;
}
