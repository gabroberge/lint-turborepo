import type { ESTree } from "@oxlint/plugins";

import type { AnalyzedMember } from "./analyzed-member";
import { memberKey } from "./member-key";
import { memberTimeline } from "./member-timeline";
import { memberVisibility } from "./member-visibility";

/** Describe every element of a class body, in source order. */
export function analyzeMembers(body: ESTree.ClassBody): AnalyzedMember[] {
	return body.body.map((node, index) => ({
		index,
		key: memberKey(node),
		node,
		overload: node.type === "MethodDefinition" && node.value.body === null,
		static: node.type === "StaticBlock" || node.static,
		timeline: memberTimeline(node),
		visibility: memberVisibility(node)
	}));
}
