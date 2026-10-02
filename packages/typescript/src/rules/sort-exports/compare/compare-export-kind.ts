import type { ExportFrom } from "../statement/is-export-from";
import { isTypeExport } from "../statement/is-type-export";

export function compareExportKind(left: ExportFrom, right: ExportFrom): number {
	if (isTypeExport(left) === isTypeExport(right)) {
		return 0;
	}

	if (isTypeExport(left)) {
		return 1;
	}

	return -1;
}
