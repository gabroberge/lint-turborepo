import { chunksOf } from "./chunks-of";

/** The source text of each member chunk of the first class of `code`. */
export function chunkTextsOf(code: string): string[] | null {
	return chunksOf(code)?.map((chunk) => code.slice(chunk.start, chunk.end)) ?? null;
}
