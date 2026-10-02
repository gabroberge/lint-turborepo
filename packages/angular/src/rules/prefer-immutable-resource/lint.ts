import type { Context, VisitorWithHooks } from "@oxlint/plugins";

import { isResourceField } from "./is-resource-field";

export function lint(context: Context): VisitorWithHooks {
	return {
		PropertyDefinition(node) {
			if (!isResourceField(node)) {
				return;
			}

			context.report({
				data: { type: "ResourceRef" },
				fix(fixer) {
					return fixer.insertTextBefore(node.key, "readonly ");
				},
				messageId: "preferImmutableResource",
				node: node.key
			});
		}
	};
}
