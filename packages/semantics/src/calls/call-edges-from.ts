import type { UnitId } from "../model/ids";
import type { ModuleModel } from "../model/module-model";
import { accessCallees } from "./access-callees";
import type { CallEdge } from "./call-edge";
import { modelIndex } from "./model-index";

const FUNCTION_EDGES = {
	"bound-locally": "may-run",
	invoked: "invokes",
	"passed-to-assumed": "defines",
	"passed-to-unknown": "may-run",
	stored: "defines"
} as const;

const EDGES = new WeakMap<ModuleModel, Map<UnitId, readonly CallEdge[]>>();

/** `callEdgesFrom`, computed once per model and unit; the result must not be changed. */
export function cachedCallEdgesFrom(model: ModuleModel, from: UnitId): readonly CallEdge[] {
	let byUnit = EDGES.get(model);
	if (byUnit === undefined) {
		byUnit = new Map();
		EDGES.set(model, byUnit);
	}

	let edges = byUnit.get(from);
	if (edges === undefined) {
		edges = buildCallEdges(model, from);
		byUnit.set(from, edges);
	}

	return edges;
}

/**
 * The call relations from one unit: those of its facts, in order, then an
 * `evaluates` edge to each `class-definition` unit of the classes its code
 * defines. Edges are computed once per model and unit: a model must not be
 * changed after it has been queried.
 */
export function callEdgesFrom(model: ModuleModel, from: UnitId): CallEdge[] {
	return [...cachedCallEdgesFrom(model, from)];
}

function buildCallEdges(model: ModuleModel, from: UnitId): CallEdge[] {
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

	for (const to of modelIndex(model).definitionUnits.get(from) ?? []) {
		edges.push({ fact: null, from, kind: "evaluates", to });
	}

	return edges;
}
