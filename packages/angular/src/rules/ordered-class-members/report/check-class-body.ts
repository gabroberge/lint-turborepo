import { blockedMoves, constrainedOrder, initializationConstraints } from "@gabroberge/typescript-class-analyzer";
import type { Context, ESTree } from "@oxlint/plugins";

import { angularAssumptions } from "../angular/angular-assumptions";
import { memberChunks } from "../layout/member-chunks";
import { collectMembers } from "../member/collect-members";
import type { ResolvedOptions } from "../options/resolved-options";
import { preferredCompare } from "../order/preferred-compare";
import { membersFix } from "./members-fix";
import { pairData } from "./pair-data";
import { reportOrder } from "./report-order";
import { reportSpacing } from "./report-spacing";
import { reportTarget } from "./report-target";

/**
 * Order the members of one class body. The target order is the preferred
 * order, constrained so that initializers which may observe each other keep
 * their source order. The constraints come from the class analyzer, told
 * what to assume about `@angular/core` calls. Members out of that order are
 * reported; once in order, blank lines are. Every fixable report shares one
 * fix that rewrites the whole member list. Preferred moves held back by an
 * uncertain interaction are reported without a fix.
 */
export function checkClassBody(context: Context, options: ResolvedOptions, body: ESTree.ClassBody): void {
	const { sourceCode } = context;
	const members = collectMembers(sourceCode, body);
	if (members.length < 2) {
		return;
	}

	const compare = preferredCompare(options);
	const conflictAt = initializationConstraints(sourceCode, body, members, angularAssumptions(sourceCode));
	const order = constrainedOrder(members, compare, (earlier, later) => conflictAt(earlier, later) !== "none");
	const chunks = memberChunks(sourceCode, body);
	const fix = membersFix(sourceCode, options, chunks, members, order);

	if (order.some((member, at) => member.index !== at)) {
		reportOrder(context, members, order, fix);
	} else {
		reportSpacing(context, options, chunks, members, fix);
	}

	for (const { earlier, later } of blockedMoves(members, compare, conflictAt)) {
		context.report({
			data: pairData(later, earlier),
			messageId: "initializationOrder",
			node: reportTarget(later.node)
		});
	}
}
