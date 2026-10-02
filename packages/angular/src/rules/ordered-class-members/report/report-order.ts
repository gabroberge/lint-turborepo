import type { Context } from "@oxlint/plugins";

import type { ClassMember } from "../member/class-member";
import type { FixProperty } from "./fix-property";
import { pairData } from "./pair-data";
import { reportTarget } from "./report-target";

/**
 * Report each member that the target order puts before the member right
 * above it. The message names the earliest-placed member it must precede,
 * which is not always its source neighbour.
 */
export function reportOrder(
	context: Context,
	members: readonly ClassMember[],
	order: readonly ClassMember[],
	fix: FixProperty
): void {
	const position = new Map(order.map((member, at) => [member, at]));
	for (const [index, member] of members.entries()) {
		const previous = members[index - 1];
		const at = position.get(member) ?? 0;
		if (previous === undefined || at > (position.get(previous) ?? 0)) {
			continue;
		}

		const overtaken = members
			.slice(0, index)
			.filter((candidate) => (position.get(candidate) ?? 0) > at)
			.reduce(
				(first, candidate) => ((position.get(candidate) ?? 0) < (position.get(first) ?? 0) ? candidate : first),
				previous
			);
		context.report({
			...fix,
			data: pairData(member, overtaken),
			messageId: "unordered",
			node: reportTarget(member.node)
		});
	}
}
