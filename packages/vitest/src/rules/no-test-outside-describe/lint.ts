import type { Context, VisitorWithHooks } from "@oxlint/plugins";

import { createDescribeNesting } from "./nesting/describe-nesting";
import { recognizedTestName } from "./test/recognized-test";

export function lint(context: Context): VisitorWithHooks {
	const nesting = createDescribeNesting();

	return {
		...nesting.visitors,
		CallExpression(node) {
			nesting.note(node);

			const calleeName = recognizedTestName(node);
			if (calleeName === null || nesting.isBelowSuite()) {
				return;
			}

			context.report({
				data: { callee: calleeName },
				messageId: "outsideDescribe",
				node
			});
		}
	};
}
