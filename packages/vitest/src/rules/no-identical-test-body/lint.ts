import type { Context, VisitorWithHooks } from "@oxlint/plugins";

import { structuralIdentity } from "./body/structural-identity";
import { createComparisonScope } from "./scope/comparison-scope";
import { comparableBodyFromCall } from "./test/comparable-body";

export function lint(context: Context): VisitorWithHooks {
	const scope = createComparisonScope();

	return {
		...scope.visitors,
		CallExpression(node) {
			scope.note(node);

			const body = comparableBodyFromCall(node);
			if (body === null) {
				return;
			}

			if (scope.isLaterCopy(structuralIdentity(body))) {
				context.report({ messageId: "identicalBody", node });
			}
		}
	};
}
