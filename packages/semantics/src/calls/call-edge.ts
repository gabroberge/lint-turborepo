import type { AccessFact, FunctionFact } from "../model/fact";
import type { UnitId } from "../model/ids";

/**
 * A relation from one unit to another unit whose code may run as a result.
 * - `calls`: the unit's code runs it directly: a method, a function, a
 *   getter read, a setter write, a field holding a function literal, a
 *   function literal called through a local binding (a `unit` target), or a
 *   module class's construction code (`new A()` runs its instance field
 *   initializers and constructor);
 * - `invokes`: the unit calls a function literal it contains right away;
 * - `may-run`: the unit hands the function to code that may call it now
 *   (passed to unknown code, bound to a local, read as a value), or calls
 *   or reads a value an assumed factory built from it, which may run it on demand;
 * - `evaluates`: the unit's code defines a module class, which runs the
 *   class's `class-definition` units (decorators and computed keys, static
 *   field initializers, static blocks), in source order;
 * - `defines`: the unit only stores the function; it runs if something calls it later.
 *
 * Each edge carries the fact it was derived from, or `null` for `evaluates`,
 * which comes from where the class is written rather than from a fact. Edges
 * come from syntax and scope resolution only: they say that a call may
 * happen, not that it does.
 */
export interface CallEdge {
	fact: AccessFact | FunctionFact | null;
	from: UnitId;
	kind: "calls" | "defines" | "evaluates" | "invokes" | "may-run";
	to: UnitId;
}
