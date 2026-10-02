import type { ESTree } from "@oxlint/plugins";

import type { CoverageKind, DecisionKind } from "./decision-kind";

/**
 * One alternative of a decision.
 *
 * `node` is the syntax that stands for the alternative (a branch, an operand,
 * a case, a loop body), or `null` when the alternative has no syntax of its
 * own (an implicit `else`, a short circuit, leaving a loop, a provided value).
 *
 * `region` is the source range whose code is written to run only along this
 * alternative, or `null` when there is none. It usually equals `node.range`,
 * with these exceptions:
 * - a `switch` case covers its consequent statements, not its `case` test
 *   (`null` for a case without statements);
 * - an optional link covers the rest of its chain after the link's object or
 *   callee, while `node` is the link itself;
 * - a `do…while` body has no region: its first iteration does not depend on
 *   the test.
 */
export interface DecisionOutcome {
	label: string;
	node: ESTree.Node | null;
	region: SourceRegion | null;
}

/**
 * A place where the syntax of a unit chooses between alternative regions of
 * code. It describes what is written, not what runs: it does not claim that
 * any outcome is reachable, taken, or covered by a test.
 */
export interface DecisionPoint {
	/**
	 * The Istanbul branch type whose locations this decision may be matched
	 * against, or `null` when coverage tools do not report it as a branch.
	 * Matching is by location and is the consumer's responsibility: the
	 * correspondence is not one to one (see `coverageKindOf`).
	 */
	coverageKind: CoverageKind | null;
	kind: DecisionKind;
	/** The deciding node: the statement or expression, the optional link, or the `AssignmentPattern`. */
	node: ESTree.Node;
	/** The alternatives, in a fixed order per kind. */
	outcomes: DecisionOutcome[];
}

/** An inclusive source range `[start, end]`, in the same offsets as `node.range`. */
export type SourceRegion = readonly [start: number, end: number];
