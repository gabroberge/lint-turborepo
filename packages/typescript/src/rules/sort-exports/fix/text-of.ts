import type { ExportFrom } from "../statement/is-export-from";

export function textOf(texts: Map<ExportFrom, string>, statement: ExportFrom): string {
	const text = texts.get(statement);
	if (text === undefined) {
		throw new Error("replace: statement text missing after analyze");
	}

	return text;
}
