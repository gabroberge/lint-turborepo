import type { ESTree } from "@oxlint/plugins";

import type { UnitId } from "./ids";
import type { AccessTarget } from "./target";

/** The unit's own code may touch `target` in this way. */
export interface AccessFact {
	kind: "access";
	mode: AccessMode;
	node: ESTree.Node;
	target: AccessTarget;
}

/**
 * - `read`: the value is evaluated;
 * - `write`: the value is assigned (compound assignments also read);
 * - `call`: the value is invoked as a function;
 * - `construct`: the value is invoked with `new` (only reported for module
 *   classes, whose construction code the model knows; any other `new`, and
 *   the parent constructor of a derived module class, is an `unknown`
 *   `construct` fact).
 */
export type AccessMode = "call" | "construct" | "read" | "write";

/** A direct fact about a unit's own code. Facts of nested functions belong to their own units. */
export type Fact = AccessFact | FunctionFact | UnknownFact;

/**
 * What happens to a function literal written in the unit's code:
 * - `stored`: its value is kept (a field, a variable, an object or array
 *   element, or an assignment to a member of a module class or to a module or
 *   closure binding) and it is not called by the unit itself;
 * - `invoked`: it is called immediately (an IIFE);
 * - `passed-to-unknown`: it is given to code outside the model, which may call it right away;
 * - `passed-to-assumed`: it is given to a call the assumptions describe as storing it;
 * - `bound-locally`: it initializes, or is assigned to, a binding local to the
 *   unit, which the unit itself may call (a call the model can follow is a
 *   `call` of a `unit` target).
 *
 * `invoked`, `passed-to-unknown` and `bound-locally` functions may run while
 * the unit runs; `stored` and `passed-to-assumed` ones run only if something
 * calls them later.
 */
export type FunctionDisposition = "bound-locally" | "invoked" | "passed-to-assumed" | "passed-to-unknown" | "stored";

/** A function literal in the unit's code, analyzed as a unit of its own. */
export interface FunctionFact {
	disposition: FunctionDisposition;
	kind: "function";
	node: ESTree.Node;
	unit: UnitId;
}

/** Something the unit's own code does that the model cannot account for. */
export interface UnknownFact {
	kind: "unknown";
	node: ESTree.Node;
	reason: UnknownReason;
}

/**
 * Why the model cannot account for what some code does.
 *
 * Code outside the model runs:
 * - `call`: a call whose callee is not code the model can follow (including
 *   a member of a module class that is undeclared, a getter's result, a
 *   signature, or a field not known to hold a function), and the application
 *   of a decorator that the assumptions do not describe;
 * - `construct`: `new` of anything but a module class, or of a derived module class;
 * - `tagged-template`, `dynamic-import`, `delete`;
 * - `suspension`: `await`, `yield` or `for await`, after which other code runs.
 *
 * The unit's receiver or reach cannot be determined:
 * - `receiver-escape`: `this`, or the class itself in static code, is handed
 *   to other code (also by a class decorator the assumptions do not describe);
 * - `unknown-receiver`: `this` inside a function whose receiver depends on how it is called;
 * - `super`: a `super` access or call;
 * - `dynamic-member`: `this[expression]` with a key that is not a literal, or a
 *   field with such a computed key, defined by its initializer;
 * - `eval`: a direct `eval`;
 * - `unanalyzed-declaration`: a nested class, a non-`const` enum or a
 *   namespace (ambient ones and `const` enums are erased and report nothing);
 * - `unsupported-target`: an assignment target the model does not understand.
 */
export type UnknownReason =
	| "call"
	| "construct"
	| "delete"
	| "dynamic-import"
	| "dynamic-member"
	| "eval"
	| "receiver-escape"
	| "super"
	| "suspension"
	| "tagged-template"
	| "unanalyzed-declaration"
	| "unknown-receiver"
	| "unsupported-target";
