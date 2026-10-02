import { hasInertKey } from "@gabroberge/typescript-class-analyzer";
import type { SourceCode } from "@oxlint/plugins";

import type { Chunk } from "../layout/chunk";
import { hasAsiHazard } from "../layout/has-asi-hazard";
import { renderMembers } from "../layout/render-members";
import type { ClassMember } from "../member/class-member";
import type { ResolvedOptions } from "../options/resolved-options";
import { expectedBlankLines } from "../spacing/expected-blank-lines";
import type { FixProperty } from "./fix-property";

/**
 * The rewrite of the whole member list into `order` with the expected
 * blank lines, or no fix when moving members as whole lines is not safe:
 * members sharing a line, stray tokens between members, a computed key that
 * runs code, or a field without `;` that would merge with its new neighbor.
 */
export function membersFix(
	sourceCode: SourceCode,
	options: ResolvedOptions,
	chunks: readonly Chunk[] | null,
	members: readonly ClassMember[],
	order: readonly ClassMember[]
): FixProperty {
	const first = chunks?.[0];
	const last = chunks?.at(-1);
	if (chunks === null || first === undefined || last === undefined) {
		return {};
	}

	const nodes = members.map((member) => member.node);
	const indexes = order.map((member) => member.index);
	if (!nodes.every((node) => hasInertKey(node)) || hasAsiHazard(sourceCode.text, nodes, indexes)) {
		return {};
	}

	return {
		fix(fixer) {
			const blankBefore = expectedBlankLines(
				options,
				order,
				(member) => chunks[member.index]?.blankLinesBefore ?? 0
			);
			return fixer.replaceTextRange(
				[first.start, last.end],
				renderMembers(sourceCode.text, chunks, indexes, blankBefore)
			);
		}
	};
}
