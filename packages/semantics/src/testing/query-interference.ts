import type { AnalyzeOptions, Interference, ModuleModel, UnitId } from "../index";
import { unitInterference } from "../index";
import { analyzeSource } from "./analyze-source";
import { queryDescribeEvidence } from "./query-describe-evidence";

export interface QueryInterference {
	/** Each piece of evidence, described by `queryDescribeEvidence`. */
	evidence: string[];
	kind: Interference["kind"];
	/** The kind with the two units swapped. */
	reversedKind: Interference["kind"];
}

/** A unit by label, or a function finding it in the model. */
export type QueryUnitSelector = string | ((model: ModuleModel) => UnitId);

/** Analyzes `code` and compares two of its units with `unitInterference`, both ways round. */
export function queryInterference(
	code: string,
	first: QueryUnitSelector,
	second: QueryUnitSelector,
	options: AnalyzeOptions = {}
): QueryInterference {
	const { model, unit } = analyzeSource(code, options);
	const resolve = (selector: QueryUnitSelector): UnitId =>
		typeof selector === "string" ? unit(selector).id : selector(model);
	const firstId = resolve(first);
	const secondId = resolve(second);
	const interference = unitInterference(model, firstId, secondId);
	return {
		evidence: interference.evidence.map((evidence) => queryDescribeEvidence(model, code, evidence)),
		kind: interference.kind,
		reversedKind: unitInterference(model, secondId, firstId).kind
	};
}
