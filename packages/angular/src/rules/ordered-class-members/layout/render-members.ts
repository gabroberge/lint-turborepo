import type { Chunk } from "./chunk";
import { lineBreakOf } from "./line-break-of";

/**
 * Builds the replacement text for `[chunks[0].start, chunks.at(-1).end)`: the chunks in `order`, separated by a
 * line break, plus a blank line where `blankBefore` (indexed by position in `order`) asks for one.
 */
export function renderMembers(
	source: string,
	chunks: readonly Chunk[],
	order: readonly number[],
	blankBefore: readonly boolean[]
): string {
	const eol = lineBreakOf(source);

	return order
		.map((chunkIndex, position) => {
			const chunk = chunks[chunkIndex];
			if (chunk === undefined) {
				throw new RangeError(`No chunk at index ${String(chunkIndex)}`);
			}

			const text = source.slice(chunk.start, chunk.end);
			if (position === 0) {
				return text;
			}

			return `${eol}${blankBefore[position] === true ? eol : ""}${chunk.indent}${text}`;
		})
		.join("");
}
