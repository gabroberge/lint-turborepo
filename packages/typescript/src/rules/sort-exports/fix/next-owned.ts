import type { SourceCode } from "@oxlint/plugins";

import type { ExportFrom } from "../statement/is-export-from";
import { blankSeparator } from "./blank-separator";
import { ownedStart } from "./owned-start";

export function nextOwned(
	source: string,
	sourceCode: SourceCode,
	cursor: number,
	statement: ExportFrom
): { separator: string; statement: ExportFrom; text: string } | null {
	const start = ownedStart(source, sourceCode, statement);
	if (start < cursor) {
		return null;
	}

	const separator = blankSeparator(source, cursor, start);
	if (separator === null) {
		return null;
	}

	return { separator, statement, text: source.slice(start, statement.range[1]) };
}
