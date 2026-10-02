/**
 * An Istanbul branch type, as reported by Istanbul instrumentation and by
 * Vitest's v8 coverage through `ast-v8-to-istanbul`. See `coverageKindOf`
 * for how decision kinds relate to it.
 */
export type CoverageKind = "binary-expr" | "cond-expr" | "default-arg" | "if" | "switch";

/**
 * The syntactic construct that chooses between alternative regions of code:
 * - `if`: an `if` statement (`then` / `else`);
 * - `conditional`: a conditional expression `a ? b : c` (`true` / `false`);
 * - `logical-and`, `logical-or`, `nullish`: the right operand of `&&`, `||`, `??` (`right` / `short-circuit`);
 * - `logical-assignment`: `a &&= b`, `a ||= b`, `a ??= b` (`assign` / `skip`);
 * - `switch`: a `switch` statement (one outcome per case, `default`, or an implicit `no-match`);
 * - `loop`: `for`, `for…in`, `for…of`, `while` and `do…while` (`body` / `exit`);
 * - `catch`: a `try` statement with a `catch` clause (`catch`);
 * - `optional-chain`: one optional link `a?.b`, `a?.[b]` or `a?.()` (`continue` / `short-circuit`);
 * - `default-value`: a default in a parameter or a destructuring pattern, `x = 1` (`default` / `provided`).
 */
export type DecisionKind =
	| "catch"
	| "conditional"
	| "default-value"
	| "if"
	| "logical-and"
	| "logical-assignment"
	| "logical-or"
	| "loop"
	| "nullish"
	| "optional-chain"
	| "switch";
