import { endOf, startOf } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import type { DecisionOutcome, DecisionPoint } from "./decision-point";

/** A decision outcome whose region contains a node. */
export interface Guard {
	decision: DecisionPoint;
	outcome: DecisionOutcome;
}

/**
 * The innermost outcome among `decisions` whose region syntactically
 * contains `node`, or `null` when none does.
 *
 * Containment is by source range (see `DecisionOutcome.region`): the test or
 * discriminant of a decision is in none of its outcomes, nor is the left
 * operand of a logical expression, the head of a loop (initializer, test,
 * update, iterated object), the `try` block, the `finally` block, a `case`
 * test, the object or callee of an optional link, or a `do…while` body. A
 * statement after a fall-through `case` is guarded by its own case only.
 *
 * This is a statement about syntax. An unguarded node is not proven to run:
 * an earlier `return`, `break` or exception may skip it, or its unit may be
 * reached only through a decision in another unit. A guarded node is not
 * proven reachable either: the outcome may never be taken.
 */
export function guardOf(node: ESTree.Node, decisions: readonly DecisionPoint[]): Guard | null {
	const start = startOf(node);
	const end = endOf(node);
	let innermost: Guard | null = null;
	let innermostSize = Number.POSITIVE_INFINITY;
	for (const decision of decisions) {
		for (const outcome of decision.outcomes) {
			const { region } = outcome;
			if (region === null || region[0] > start || end > region[1]) {
				continue;
			}

			const size = region[1] - region[0];
			if (size <= innermostSize) {
				innermost = { decision, outcome };
				innermostSize = size;
			}
		}
	}

	return innermost;
}
