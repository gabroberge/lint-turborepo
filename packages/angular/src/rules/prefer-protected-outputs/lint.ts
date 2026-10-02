import type { Context, VisitorWithHooks } from "@oxlint/plugins";

import { applyProtected } from "./apply-protected";
import { isOutputField } from "./is-output-field";

export function lint(context: Context): VisitorWithHooks {
	return {
		PropertyDefinition(node) {
			if (!isOutputField(node)) {
				return;
			}

			context.report({
				data: { type: "OutputEmitterRef" },
				fix(fixer) {
					return applyProtected(fixer, context.sourceCode.text, node);
				},
				messageId: "preferProtectedOutput",
				node: node.key
			});
		}
	};
}
