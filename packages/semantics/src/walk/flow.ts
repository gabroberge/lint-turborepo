/**
 * How the value of an expression is used, which decides what a function
 * literal written there becomes:
 * - `store`: kept for later (an initializer, an element of a stored object);
 * - `assumed`: passed to a call the assumptions describe as storing it;
 * - `local`: bound to a local of the unit, which the unit may call itself;
 * - `run`: anything else, including arguments of unknown calls, where the
 *   function may run right away.
 */
export type Flow = "assumed" | "local" | "run" | "store";
