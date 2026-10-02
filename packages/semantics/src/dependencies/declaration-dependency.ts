import type { AccessFact } from "../model/fact";
import type { DeclarationId, UnitId } from "../model/ids";

/**
 * A direct relation from code owned by one declaration to another
 * declaration, with the fact it was derived from.
 * - `from` is the declaration owning the unit whose code holds the fact (a
 *   function literal belongs to the declaration of its nearest enclosing
 *   unit that has one), or `null` for module code;
 * - `to` is the declaration an access resolves to;
 * - `mode` is the access mode.
 *
 * A dependency is direct and syntactic: it says the code refers to the
 * declaration in that way, not that the code runs. Transitive relations come
 * from following dependencies, for example with `stronglyConnectedComponents`.
 */
export interface DeclarationDependency {
	fact: AccessFact;
	from: DeclarationId | null;
	mode: AccessFact["mode"];
	to: DeclarationId;
	unit: UnitId;
}
