import type { CallEdge, ModuleModel, UnitId } from "../index";

/** A call edge as one line, such as `Cart.total -calls-> Cart.value (get)`. */
export function queryDescribeEdge(model: ModuleModel, edge: CallEdge): string {
	return `${queryLabel(model, edge.from)} -${edge.kind}-> ${queryLabel(model, edge.to)}`;
}

/** The label of a unit, or its id when the model has no such unit. */
export function queryLabel(model: ModuleModel, unit: UnitId): string {
	return model.units.get(unit)?.label ?? unit;
}
