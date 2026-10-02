import type { ModuleModel } from "../model/module-model";
import type { DeclarationDependency } from "./declaration-dependency";
import { ownerOf } from "./owner-of";

/**
 * Every direct dependency between the module's declarations, unit by unit,
 * in the order of each unit's facts. Accesses that resolve to no declaration
 * (globals, closure bindings, properties of other objects, undeclared
 * members) are not dependencies; they remain facts of the unit. A field
 * initializer defining its own field is not reported.
 */
export function declarationDependencies(model: ModuleModel): DeclarationDependency[] {
	const dependencies: DeclarationDependency[] = [];
	for (const unit of model.units.values()) {
		const from = ownerOf(model, unit.id);
		for (const fact of unit.facts) {
			if (fact.kind !== "access") {
				continue;
			}

			const { target } = fact;
			const to = target.kind === "member" ? target.member : target.kind === "binding" ? target.declaration : null;
			const definesItself = to !== null && to === from && fact.node === model.declarations.get(to)?.node;
			if (to !== null && !definesItself) {
				dependencies.push({ fact, from, mode: fact.mode, to, unit: unit.id });
			}
		}
	}

	return dependencies;
}
