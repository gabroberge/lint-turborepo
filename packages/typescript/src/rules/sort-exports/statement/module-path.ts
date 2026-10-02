import type { ExportFrom } from "./is-export-from";

export function modulePath(statement: ExportFrom): string {
	return statement.source.value;
}
