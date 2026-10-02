import { renderMembers } from "../layout/render-members";
import { chunksOf } from "./chunks-of";

/** `code` with the members of its first class rendered in `order`, with blank lines where `blankBefore` asks. */
export function renderClass(code: string, order: readonly number[], blankBefore: readonly boolean[]): string {
	const chunks = chunksOf(code);
	const first = chunks?.[0];
	const last = chunks?.at(-1);
	if (chunks === null || first === undefined || last === undefined) {
		throw new Error("Expected movable members");
	}

	return `${code.slice(0, first.start)}${renderMembers(code, chunks, order, blankBefore)}${code.slice(last.end)}`;
}
