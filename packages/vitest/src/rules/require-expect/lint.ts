import type { Context, VisitorWithHooks } from "@oxlint/plugins";

import { expectInOwnBody } from "./expect/in-own-body";
import { executableTestFromCall } from "./test/from-call";

export function lint(context: Context): VisitorWithHooks {
	return {
		CallExpression(node) {
			const test = executableTestFromCall(node);
			if (test === null) {
				return;
			}

			if (expectInOwnBody(test.callback)) {
				return;
			}

			context.report({
				data: { callee: test.callee },
				messageId: "missingExpect",
				node: test.node
			});
		}
	};
}
