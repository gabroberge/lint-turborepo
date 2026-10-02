import type { ExportFrom } from "../statement/is-export-from";
import { groupOf } from "./group-of";
import { parse } from "./parse";

export function pair(code: string): [ExportFrom, ExportFrom] {
	const [left, right] = groupOf(parse(code).body);
	if (right === undefined) {
		throw new Error("expected two statements");
	}

	return [left, right];
}
