/**
 * What the analysis may assume about a call whose callee it cannot see into.
 *
 * - `factory`: the call neither observes nor changes state another
 *   initializer could depend on. Function literals passed to it are stored,
 *   not run. Its other arguments are still evaluated and analyzed, and so is
 *   its callee unless the callee is a plain name (`make`, `lib.make`); a
 *   callee reached through the analyzed object (`this.lib.make`) still reads
 *   that member.
 * - `signal-factory`: everything a `factory` is, and a field holding its
 *   result may be called. Calling it runs the functions given to the factory
 *   (their effects count) and counts as reading outside state, not as a side
 *   effect: it conflicts with side-effecting initializers, but not with other
 *   reads.
 */
export type CallAssumption = "factory" | "signal-factory";
