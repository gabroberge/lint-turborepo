import type { Context, VisitorWithHooks } from "@oxlint/plugins";

import { isArrangeAt } from "./arrange/is-arrange-at";
import { createDirectTestBody } from "./test-body/create-direct-test-body";

export function lint(context: Context): VisitorWithHooks {
	const testBody = createDirectTestBody();

	return {
		...testBody.visitors,
		CallExpression(node) {
			testBody.note(node);
		},
		ExpressionStatement(node) {
			if (testBody.inDirectBody() && isArrangeAt(node)) {
				context.report({ messageId: "arrangeInTest", node });
			}
		},
		VariableDeclarator(node) {
			if (testBody.inDirectBody() && isArrangeAt(node)) {
				context.report({ messageId: "arrangeInTest", node });
			}
		}
	};
}
