import type { Context } from "@oxlint/plugins";

import type { Chunk } from "../layout/chunk";
import type { ClassMember } from "../member/class-member";
import type { ResolvedOptions } from "../options/resolved-options";
import { blankLinePolicy } from "../spacing/blank-line-policy";
import { blankLinesBetween } from "../spacing/blank-lines-between";
import type { FixProperty } from "./fix-property";
import { reportTarget } from "./report-target";

/**
 * Report blank lines between members, already in order, that break the
 * spacing policy. Without movable chunks (members sharing a line, stray
 * tokens) the count comes from the member ranges, and the report has no fix.
 */
export function reportSpacing(
	context: Context,
	options: ResolvedOptions,
	chunks: readonly Chunk[] | null,
	members: readonly ClassMember[],
	fix: FixProperty
): void {
	for (const [index, member] of members.entries()) {
		const previous = members[index - 1];
		if (previous === undefined) {
			continue;
		}

		const actual =
			chunks?.[index]?.blankLinesBefore ?? blankLinesBetween(context.sourceCode.text, previous.node, member.node);
		const policy = blankLinePolicy(options, previous, member);
		const node = reportTarget(member.node);
		if (policy === "always" && actual === 0) {
			context.report({ ...fix, data: { name: member.label }, messageId: "missingBlankLine", node });
		} else if (policy === "always" && actual > 1) {
			context.report({
				...fix,
				data: { expected: "exactly one blank line", name: member.label },
				messageId: "extraBlankLine",
				node
			});
		} else if (policy === "never" && actual > 0) {
			context.report({
				...fix,
				data: { expected: "no blank line", name: member.label },
				messageId: "extraBlankLine",
				node
			});
		}
	}
}
