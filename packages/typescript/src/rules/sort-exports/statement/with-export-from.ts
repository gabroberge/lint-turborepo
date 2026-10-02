import type { ExportFrom } from "./is-export-from";

export type Group = readonly [ExportFrom, ...ExportFrom[]];

export function withExportFrom(group: Group | null, statement: ExportFrom): Group {
	if (group === null) {
		return [statement];
	}

	return [...group, statement];
}
