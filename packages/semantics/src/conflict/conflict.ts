/**
 * How two initializers constrain each other. `definite`: one reads or
 * writes what the other defines or writes. `uncertain`: their side effects
 * may interact. Both keep their source order; only `uncertain` is worth
 * reporting when the preferred order disagrees. `none`: no interaction was
 * found under the analysis's assumptions, which is not a proof that the
 * swap is unobservable.
 */
export type Conflict = "definite" | "none" | "uncertain";
