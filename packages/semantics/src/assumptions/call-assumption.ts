/**
 * What the model may assume about a call into code it cannot see.
 *
 * - `factory`: the call neither observes nor changes state that other code
 *   could depend on, so it produces no `call` uncertainty. Function literals
 *   passed to it are stored, not run (`passed-to-assumed`). Its arguments are
 *   still analyzed, and so is its callee unless the callee is a plain name
 *   (`make`, `lib.make`).
 * - `signal-factory`: everything a `factory` is; in addition, a field
 *   initialized with its result holds a signal-like callable (field value
 *   `assumed-callable`): calling it reads that value's own state and runs only
 *   the functions given to the factory.
 */
export type CallAssumption = "factory" | "signal-factory";
