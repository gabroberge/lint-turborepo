import type { ExportFrom } from "../statement/is-export-from";
import { modulePath } from "../statement/module-path";
import { names } from "../statement/names";
import { compareExportKind } from "./compare-export-kind";
import { compareNames } from "./compare-names";
import { compareText } from "./compare-text";

export function compare(left: ExportFrom, right: ExportFrom): number {
	const source = compareText(modulePath(left), modulePath(right));
	if (source !== 0) {
		return source;
	}

	const kind = compareExportKind(left, right);
	if (kind !== 0) {
		return kind;
	}

	return compareNames(names(left), names(right));
}
