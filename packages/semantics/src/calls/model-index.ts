import type { FunctionDisposition } from "../model/fact";
import type { DeclarationId, UnitId } from "../model/ids";
import type { MemberKey } from "../model/member-key";
import type { ModuleModel } from "../model/module-model";
import type { Unit } from "../model/unit";

/**
 * Lookups over one model that the call queries need for every access, built
 * once per model. A model is treated as immutable once queried: results are
 * cached by model identity.
 */
export interface ModelIndex {
	/** The units of each module class's `class-definition` code, by the unit containing the class, in id order. */
	definitionUnits: ReadonlyMap<UnitId, readonly UnitId[]>;
	/** What happens to each function literal's unit, from the `function` fact that introduces it. */
	dispositions: ReadonlyMap<UnitId, FunctionDisposition>;
	/** Each module class's `instance-construction` units (instance field initializers, the constructor), in id order. */
	instanceConstruction: ReadonlyMap<DeclarationId, readonly UnitId[]>;
	/** Members by class, side and runtime key (see `memberIndexKey`), in declaration order. */
	members: ReadonlyMap<string, readonly DeclarationId[]>;
	/** Each unit's position in `model.units`. */
	ordinals: ReadonlyMap<UnitId, number>;
	/** Units by their own declaration, in id order. */
	unitsByDeclaration: ReadonlyMap<DeclarationId, readonly Unit[]>;
}

const INDEXES = new WeakMap<ModuleModel, ModelIndex>();

/** The key under which `ModelIndex.members` files a member: its class, side and runtime key. */
export function memberIndexKey(classId: DeclarationId, isStatic: boolean, key: MemberKey): string {
	return JSON.stringify([classId, isStatic, key.private, key.name]);
}

/** The lookups for `model`, built on first use. */
export function modelIndex(model: ModuleModel): ModelIndex {
	const cached = INDEXES.get(model);
	if (cached !== undefined) {
		return cached;
	}

	const index = buildIndex(model);
	INDEXES.set(model, index);
	return index;
}

function append<Key, Value>(map: Map<Key, Value[]>, key: Key, value: Value): void {
	const values = map.get(key);
	if (values === undefined) {
		map.set(key, [value]);
	} else {
		values.push(value);
	}
}

function buildIndex(model: ModuleModel): ModelIndex {
	const members = new Map<string, DeclarationId[]>();
	for (const declaration of model.declarations.values()) {
		if ("class" in declaration && declaration.key !== null) {
			append(members, memberIndexKey(declaration.class, declaration.static, declaration.key), declaration.id);
		}
	}

	const definitionUnits = new Map<UnitId, UnitId[]>();
	const dispositions = new Map<UnitId, FunctionDisposition>();
	const instanceConstruction = new Map<DeclarationId, UnitId[]>();
	const ordinals = new Map<UnitId, number>();
	const unitsByDeclaration = new Map<DeclarationId, Unit[]>();
	for (const unit of model.units.values()) {
		ordinals.set(unit.id, ordinals.size);
		for (const fact of unit.facts) {
			if (fact.kind === "function") {
				dispositions.set(fact.unit, fact.disposition);
			}
		}

		if (unit.trigger === "class-definition" && unit.parent !== null) {
			append(definitionUnits, unit.parent, unit.id);
		}

		if (unit.declaration === null) {
			continue;
		}

		append(unitsByDeclaration, unit.declaration, unit);
		const owner = model.declarations.get(unit.declaration);
		if (unit.trigger === "instance-construction" && owner !== undefined && "class" in owner) {
			append(instanceConstruction, owner.class, unit.id);
		}
	}

	return { definitionUnits, dispositions, instanceConstruction, members, ordinals, unitsByDeclaration };
}
