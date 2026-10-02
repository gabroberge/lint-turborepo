import type { Context, VisitorWithHooks } from "@oxlint/plugins";

import { createDescribeScope } from "./describe/scope";
import { selectFix } from "./fix/select";
import { whenInTestTitle } from "./title/when-in-test-title";

export function lint(context: Context): VisitorWithHooks {
	const describes = createDescribeScope();

	return {
		...describes.visitors,
		CallExpression(node) {
			describes.note(node);

			const violation = whenInTestTitle(node);
			if (violation === null) {
				return;
			}

			context.report({
				data: { callee: violation.callee },
				fix(fixer) {
					const replacement = selectFix(
						context.sourceCode.text,
						node,
						violation.title,
						describes.enclosingTitle()
					);

					if (replacement === null) {
						return null;
					}

					return fixer.replaceTextRange(replacement.range, replacement.text);
				},
				messageId: "whenInTitle",
				node: violation.title
			});
		}
	};
}
