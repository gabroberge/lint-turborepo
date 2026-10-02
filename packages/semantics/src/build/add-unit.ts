import type { Unit } from "../model/unit";
import type { ModelDraft } from "./model-draft";

/** Register a unit, with no facts yet, and give it the next id. */
export function addUnit(draft: ModelDraft, unit: Omit<Unit, "facts" | "id">): Unit {
	const added: Unit = { ...unit, facts: [], id: `u${String(draft.units.size)}` };
	draft.units.set(added.id, added);
	return added;
}
