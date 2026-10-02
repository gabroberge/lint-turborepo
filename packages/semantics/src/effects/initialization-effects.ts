import type { ESTree, SourceCode } from "@oxlint/plugins";

import type { ClassAssumptions } from "../assumptions/class-assumptions";
import type { AnalyzedMember } from "../member/analyzed-member";
import type { Timeline } from "../member/timeline";
import { collectEffects } from "../walk/collect-effects";
import type { Effects } from "./effects";
import { emptyEffects } from "./empty-effects";
import { invocationSummaries } from "./invocation-summaries";
import { opaqueEffects } from "./opaque-effects";
import { resolveEffects } from "./resolve-effects";
import { timelineTable } from "./timeline-table";

/**
 * What each member's initialization may do, indexed like `members`, or
 * `null` for a member that runs nothing while the class is set up. A
 * static block, or a field whose computed key is not a string or number
 * literal, is opaque.
 */
export function initializationEffects(
	sourceCode: SourceCode,
	body: ESTree.ClassBody,
	members: readonly AnalyzedMember[],
	assumptions: ClassAssumptions
): (Effects | null)[] {
	const classId =
		body.parent.type === "ClassDeclaration" || body.parent.type === "ClassExpression" ? body.parent.id : null;
	const scopes = new Map(
		(["instance", "static"] as const).map((timeline: Timeline) => {
			const scope = {
				assumptions,
				classId,
				kinds: timelineTable(assumptions, members, timeline),
				sourceCode,
				timeline
			};
			return [timeline, { scope, summaries: invocationSummaries(members, scope, timeline) }] as const;
		})
	);

	return members.map(({ key, node, timeline }) => {
		if (timeline === null) {
			return null;
		}

		if (key === null || node.type === "StaticBlock" || node.type === "TSIndexSignature") {
			return opaqueEffects();
		}

		if (node.type !== "PropertyDefinition" && node.type !== "AccessorProperty") {
			return null;
		}

		if (node.value === null) {
			return emptyEffects();
		}

		const analysis = scopes.get(timeline);
		if (analysis === undefined) {
			return opaqueEffects();
		}

		const direct = collectEffects(node.value, { ...analysis.scope, owner: node }, true).effects;
		return resolveEffects(direct, analysis.summaries);
	});
}
