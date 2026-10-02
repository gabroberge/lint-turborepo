import type { InterferenceEvidence, ModuleModel } from "../index";
import { queryDescribeReached } from "./query-describe-reached";

/**
 * Interference evidence as one line: the reason, then each side's reached
 * fact (`-` for none), such as `same-location: read A.x / write A.x`.
 */
export function queryDescribeEvidence(model: ModuleModel, code: string, evidence: InterferenceEvidence): string {
	const side = (reached: InterferenceEvidence["first"]): string =>
		reached === null ? "-" : queryDescribeReached(model, code, reached);
	return `${evidence.reason}: ${side(evidence.first)} / ${side(evidence.second)}`;
}
