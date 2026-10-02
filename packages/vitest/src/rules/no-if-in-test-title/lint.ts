import type { Context, VisitorWithHooks } from "@oxlint/plugins";

import { titleContainsIf } from "./title/contains-if";
import { testTitleFromCall } from "./title/from-call";

export function lint(context: Context): VisitorWithHooks {
	return {
		CallExpression(node) {
			const testTitle = testTitleFromCall(node);
			if (testTitle === null) {
				return;
			}

			if (!titleContainsIf(testTitle.title)) {
				return;
			}

			context.report({
				data: { callee: testTitle.callee },
				messageId: "ifInTitle",
				node: testTitle.title
			});
		}
	};
}
