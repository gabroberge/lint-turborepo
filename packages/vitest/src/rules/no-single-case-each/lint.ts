import type { Context, VisitorWithHooks } from "@oxlint/plugins";

import { eachCalleeName } from "./each/each-callee-name";
import { staticCaseCount } from "./table/static-case-count";

export function lint(context: Context): VisitorWithHooks {
	return {
		CallExpression(node) {
			const calleeName = eachCalleeName(node.callee);
			if (calleeName === null) {
				return;
			}

			if (staticCaseCount(node.arguments[0]) !== 1) {
				return;
			}

			context.report({
				data: { callee: calleeName },
				messageId: "singleCase",
				node
			});
		}
	};
}
