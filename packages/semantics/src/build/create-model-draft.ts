import type { SourceCode } from "@oxlint/plugins";

import type { Assumptions } from "../assumptions/assumptions";
import type { ModelDraft } from "./model-draft";

export function createModelDraft(sourceCode: SourceCode, assumptions: Assumptions): ModelDraft {
	return {
		assumptions,
		boundaries: new Set(),
		classByNode: new Map(),
		classByVariable: new Map(),
		declarationByVariable: new Map(),
		declarations: new Map(),
		membersByClass: new Map(),
		sourceCode,
		unitByNode: new Map(),
		units: new Map(),
		unresolvedUnitTargets: []
	};
}
