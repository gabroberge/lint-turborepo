import type { Context, ESTree } from "@oxlint/plugins";

import { isSorted } from "./compare/is-sorted";
import { analyze } from "./fix/analyze";
import { applyRewrite } from "./fix/apply-rewrite";
import { rewrite } from "./fix/rewrite";
import { groups } from "./statement/groups";

export function lint(context: Context, program: ESTree.Program): void {
	for (const group of groups(program.body)) {
		if (isSorted(group)) {
			continue;
		}

		const replacement = rewrite(analyze(context.sourceCode, group), group);

		context.report({
			fix(fixer) {
				return applyRewrite(fixer, replacement);
			},
			messageId: "unsorted",
			node: group[0]
		});
	}
}
