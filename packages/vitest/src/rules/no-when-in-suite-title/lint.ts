import type { Context, VisitorWithHooks } from "@oxlint/plugins";

import { isTitledDescribe } from "./suite/is-titled-describe";
import { createOutermostDescribe } from "./suite/outermost-describe";
import { leadingWhenTitle } from "./title/leading-when-title";

export function lint(context: Context): VisitorWithHooks {
	const outermost = createOutermostDescribe();

	return {
		...outermost.visitors,
		CallExpression(node) {
			outermost.note(node);
			if (!outermost.isOutermost() || !isTitledDescribe(node)) {
				return;
			}

			const title = leadingWhenTitle(node.arguments[0]);
			if (title === null) {
				return;
			}

			context.report({
				messageId: "whenInSuiteTitle",
				node: title
			});
		}
	};
}
