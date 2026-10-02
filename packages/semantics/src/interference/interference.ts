import type { ReachedFact } from "../calls/reached-fact";

/**
 * Whether running two units in either order may give different results:
 * - `definite`: the model shows them touching the same location (on the same
 *   receiver, when both run against the same one);
 * - `possible`: only uncertainty relates them;
 * - `none`: nothing in the model relates them.
 *
 * `none` is a may-analysis result under the model's assumptions, not a proof
 * of independence: state reached only through references the model does not
 * follow (a module class handed to outside code, a property alias) is not
 * compared.
 */
export interface Interference {
	evidence: InterferenceEvidence[];
	kind: "definite" | "none" | "possible";
}

/** One piece of evidence: the reached facts (with their call paths) on each side. */
export interface InterferenceEvidence {
	first: ReachedFact | null;
	reason: InterferenceReason;
	second: ReachedFact | null;
}

/**
 * Why two units' effects may depend on the order in which they run:
 * - `same-location`: both touch the same location tracked by the model (a
 *   member key of a module class, a module binding, a global by name), and
 *   at least one writes it;
 * - `opaque`: one side has an uncertainty after which it may touch anything
 *   (an escaping or unknown receiver, `super`, a dynamic member, `eval`, an
 *   unanalyzed declaration or assignment target), and the other side touches
 *   something (an access to state, or an outside or opaque fact); `second`
 *   is `null` when it is the first unit's, `first` when it is the second's;
 * - `outside-effects`: one side runs code outside the model or changes state
 *   the model does not track, and the other does the same, reads state that
 *   such code could change, or writes a module binding, global or static
 *   member that a function handed to outside code reads (outside code
 *   running on the first side may run that function).
 */
export type InterferenceReason = "opaque" | "outside-effects" | "same-location";
