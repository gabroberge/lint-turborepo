import type { ExportFrom } from "./is-export-from";

export function isTypeExport(statement: ExportFrom): boolean {
	return statement.exportKind === "type";
}
