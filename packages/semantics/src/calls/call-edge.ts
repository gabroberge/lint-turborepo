import type { AccessFact, FunctionFact } from "../model/fact";
import type { UnitId } from "../model/ids";

/**
 * A relation from one unit to another unit whose code may run as a result.
 * - `calls`: the unit's code calls it directly (a method, a function, a
 *   getter read, a setter write, a field holding a function literal);
 * - `invokes`: the unit calls a function literal it contains right away;
 * - `may-run`: the unit hands the function to code that may call it now
 *   (passed to unknown code, bound to a local, or read as a value);
 * - `defines`: the unit only stores the function; it runs if something calls it later.
 *
 * Each edge carries the fact it was derived from. Edges come from syntax and
 * scope resolution only: they say that a call may happen, not that it does.
 */
export interface CallEdge {
	fact: AccessFact | FunctionFact;
	from: UnitId;
	kind: "calls" | "defines" | "invokes" | "may-run";
	to: UnitId;
}
