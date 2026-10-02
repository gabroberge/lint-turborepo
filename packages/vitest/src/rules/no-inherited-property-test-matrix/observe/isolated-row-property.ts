import type { EachRow } from "./each-row-of";
import { isolatedTableProperty } from "./isolated-table-property";
import { rebinds } from "./rebinds";
import { rowParameterName } from "./row-parameter-name";

export function isolatedRowProperty(name: string, eachRow: EachRow): string | null {
	const row = rowParameterName(eachRow.callback);
	if (row === null || row !== name || rebinds(eachRow.callback, row)) {
		return null;
	}

	return isolatedTableProperty(eachRow.table);
}
