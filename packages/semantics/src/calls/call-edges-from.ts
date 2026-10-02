import type { UnitId } from "../model/ids";
import type { ModuleModel } from "../model/module-model";
import { accessCallees } from "./access-callees";
import type { CallEdge } from "./call-edge";

const FUNCTION_EDGES = {
	"bound-locally": "may-run",
	invoked: "invokes",
	"passed-to-assumed": "defines",
	"passed-to-unknown": "may-run",
	stored: "defines"
} as const;

/** The call relations from one unit, in the order of its facts. */
export function callEdgesFrom(model: ModuleModel, from: UnitId): CallEdge[] {
	const unit = model.units.get(from);
	if (unit === undefined) {
		return [];
	}

	const edges: CallEdge[] = [];
	for (const fact of unit.facts) {
		if (fact.kind === "function") {
			edges.push({ fact, from, kind: FUNCTION_EDGES[fact.disposition], to: fact.unit });
		} else if (fact.kind === "access") {
			for (const callee of accessCallees(model, fact)) {
				edges.push({ fact, from, kind: callee.kind, to: callee.unit });
			}
		}
	}

	return edges;
}
