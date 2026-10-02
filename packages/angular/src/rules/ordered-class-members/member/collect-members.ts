import { analyzeMembers } from "@gabroberge/typescript-class-analyzer";
import type { ESTree, SourceCode } from "@oxlint/plugins";

import type { ClassMember } from "./class-member";
import { memberCategory } from "./member-category";
import { memberLabel } from "./member-label";

export function collectMembers(sourceCode: SourceCode, body: ESTree.ClassBody): ClassMember[] {
	return analyzeMembers(body).map((member) => ({
		...member,
		category: memberCategory(sourceCode, member.node, member.key),
		label: memberLabel(sourceCode, member.node, member.key)
	}));
}
