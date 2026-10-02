import { isFunctionNode, unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import type { FieldValue } from "../model/declaration";
import type { ModelDraft } from "./model-draft";

/** What an initializer evaluates to, as far as calling the initialized binding or field is concerned. */
export function valueOf(draft: ModelDraft, value: ESTree.Expression | null | undefined): FieldValue {
	if (value === null || value === undefined) {
		return "none";
	}

	const expression = unwrapExpression(value);
	if (isFunctionNode(expression)) {
		return "function";
	}

	if (expression.type === "CallExpression" && draft.assumptions.assumeCall(expression) === "signal-factory") {
		return "assumed-callable";
	}

	return "other";
}
