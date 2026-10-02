import type { FunctionNode } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import type { RecognizedTest } from "../recognize/test";

export interface EachRow {
	callback: FunctionNode;
	table: ESTree.Expression;
}

export function eachRowOf(test: RecognizedTest): EachRow | null {
	if (test.caseCount.kind !== "each") {
		return null;
	}

	return { callback: test.callback, table: test.caseCount.table };
}
