import type { SourceCode } from "@oxlint/plugins";

import type { ExportFrom } from "../statement/is-export-from";
import { lineStart } from "./line-start";

export function ownedStart(source: string, sourceCode: SourceCode, statement: ExportFrom): number {
	const [anchor] = sourceCode.getCommentsBefore(statement);
	if (anchor === undefined) {
		return lineStart(source, statement.range[0]);
	}

	return lineStart(source, anchor.range[0]);
}
