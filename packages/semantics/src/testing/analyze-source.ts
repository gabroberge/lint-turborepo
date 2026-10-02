import type { AnalyzeOptions, Fact, ModuleModel, Unit } from "../index";
import { analyzeModule } from "../index";
import { describeFact } from "./describe-fact";
import { parseModule } from "./parse-module";

export interface AnalyzedSource {
	/** Every fact of the unit labelled `label`, described by `describeFact`. */
	facts: (label: string) => string[];
	model: ModuleModel;
	/** The unit labelled `label`; throws when there is none or several. */
	unit: (label: string) => Unit;
}

/** Parses `code` and builds its module model, with lookups by unit label. */
export function analyzeSource(code: string, options: AnalyzeOptions = {}): AnalyzedSource {
	const sourceCode = parseModule(code);
	const model = analyzeModule(sourceCode, options);
	const unit = (label: string): Unit => {
		const found = [...model.units.values()].filter((candidate) => candidate.label === label);
		const [only] = found;
		if (only === undefined || found.length > 1) {
			const labels = [...model.units.values()].map((candidate) => candidate.label).join(", ");
			throw new Error(`Expected one unit labelled ${label}, found ${String(found.length)} among: ${labels}`);
		}

		return only;
	};

	return {
		facts: (label) =>
			unit(label).facts.map((fact: Fact) => describeFact(model, sourceCode.getText(fact.node), fact)),
		model,
		unit
	};
}
