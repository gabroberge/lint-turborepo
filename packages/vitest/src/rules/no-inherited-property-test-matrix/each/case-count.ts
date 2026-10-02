import type { ESTree } from "@oxlint/plugins";

import { parameterizationOf } from "./parameterization-of";
import { staticCaseCount } from "./static-case-count";

export type CaseCount =
	| { kind: "each"; count: number; table: ESTree.Expression }
	| { kind: "single" }
	| { kind: "unknown" };

export function caseCountOf(node: ESTree.CallExpression): CaseCount {
	const parameterization = parameterizationOf(node);
	if (parameterization === null) {
		return { kind: "single" };
	}

	if (parameterization.modifier === "for" || parameterization.table === null) {
		return { kind: "unknown" };
	}

	const count = staticCaseCount(parameterization.table);
	if (count === null || count === 0) {
		return { kind: "unknown" };
	}

	return { count, kind: "each", table: parameterization.table };
}
