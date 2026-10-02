import type { ModuleModel, UnitId } from "../index";

export interface QueryMemberSelector {
	/** The class's qualified name. */
	class: string;
	/** The key's name, without `#`. */
	name: string;
	/** True for a `#private` key; defaults to false. */
	private?: boolean;
	/** True for a static member; defaults to false. */
	static?: boolean;
}

/**
 * The single unit of a class member's own code (not a function literal in
 * it), found by key rather than by label: labels do not tell `#x` from
 * `"#x"`, nor a static member from an instance one. Throws unless exactly
 * one unit matches.
 */
export function queryMemberUnit(model: ModuleModel, selector: QueryMemberSelector): UnitId {
	const found = [...model.units.values()].filter((unit) => {
		const member = unit.declaration === null ? undefined : model.declarations.get(unit.declaration);
		if (member === undefined || unit.kind === "function" || !("class" in member) || member.key === null) {
			return false;
		}

		return (
			model.declarations.get(member.class)?.qualifiedName === selector.class &&
			member.key.name === selector.name &&
			member.key.private === (selector.private ?? false) &&
			member.static === (selector.static ?? false)
		);
	});
	const [only] = found;
	if (only === undefined || found.length > 1) {
		throw new Error(`Expected one unit for ${JSON.stringify(selector)}, found ${String(found.length)}`);
	}

	return only.id;
}
