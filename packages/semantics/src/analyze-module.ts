import type { SourceCode } from "@oxlint/plugins";

import type { Assumptions } from "./assumptions/assumptions";
import { NO_ASSUMPTIONS } from "./assumptions/no-assumptions";
import { buildModuleUnit } from "./build/build-module-unit";
import { collectModuleDeclarations } from "./build/collect-module-declarations";
import { createModelDraft } from "./build/create-model-draft";
import type { ModuleModel } from "./model/module-model";

export interface AnalyzeOptions {
	/** Knowledge about code outside the module; defaults to `NO_ASSUMPTIONS`. */
	assumptions?: Assumptions;
}

/**
 * Build the semantic model of one module from its source code (an ESLint or
 * oxlint `SourceCode` with scope analysis). The model holds the module's
 * declarations and executable units, each with the direct facts about its
 * own code.
 */
export function analyzeModule(sourceCode: SourceCode, options: AnalyzeOptions = {}): ModuleModel {
	const draft = createModelDraft(sourceCode, options.assumptions ?? NO_ASSUMPTIONS);
	collectModuleDeclarations(draft, sourceCode.ast);
	const moduleUnit = buildModuleUnit(draft, sourceCode.ast);
	return {
		boundaries: draft.boundaries,
		declarations: draft.declarations,
		moduleUnit: moduleUnit.id,
		units: draft.units
	};
}
