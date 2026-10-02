import type { SourceCode } from "@oxlint/plugins";

import type { ExportFrom } from "../statement/is-export-from";
import type { Group } from "../statement/with-export-from";
import { nextOwned } from "./next-owned";
import { ownedStart } from "./owned-start";

export interface Source {
	first: { statement: ExportFrom; text: string };
	range: [number, number];
	rest: { separator: string; statement: ExportFrom; text: string }[];
}

export function analyze(sourceCode: SourceCode, group: Group): Source | null {
	const source = sourceCode.text;
	const firstStatement = group[0];
	const rangeStart = ownedStart(source, sourceCode, firstStatement);
	const firstEnd = firstStatement.range[1];
	const rest: Source["rest"] = [];
	let cursor = firstEnd;

	for (const statement of group.slice(1)) {
		const item = nextOwned(source, sourceCode, cursor, statement);
		if (item === null) {
			return null;
		}

		rest.push(item);
		cursor = statement.range[1];
	}

	return {
		first: { statement: firstStatement, text: source.slice(rangeStart, firstEnd) },
		range: [rangeStart, cursor],
		rest
	};
}
