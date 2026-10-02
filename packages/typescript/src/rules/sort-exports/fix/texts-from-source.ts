import type { ExportFrom } from "../statement/is-export-from";
import type { Source } from "./analyze";

export function textsFromSource(source: Source): Map<ExportFrom, string> {
	const texts = new Map<ExportFrom, string>([[source.first.statement, source.first.text]]);

	for (const item of source.rest) {
		texts.set(item.statement, item.text);
	}

	return texts;
}
