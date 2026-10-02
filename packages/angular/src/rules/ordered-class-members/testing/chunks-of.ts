import type { Chunk } from "../layout/chunk";
import { memberChunks } from "../layout/member-chunks";
import { parseClass } from "./parse-class";

/** The member chunks of the first class of `code`. */
export function chunksOf(code: string): Chunk[] | null {
	const { body, sourceCode } = parseClass(code);

	return memberChunks(sourceCode, body);
}
