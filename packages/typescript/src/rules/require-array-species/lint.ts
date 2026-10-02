import type { Context, VisitorWithHooks } from "@oxlint/plugins";

import { checkClass } from "./check-class";

export function lint(context: Context): VisitorWithHooks {
	return {
		ClassDeclaration(node) {
			checkClass(context, node);
		},
		ClassExpression(node) {
			checkClass(context, node);
		}
	};
}
