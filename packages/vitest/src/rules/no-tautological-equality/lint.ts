import type { Context, VisitorWithHooks } from "@oxlint/plugins";

import { equalityAssertionFromCall } from "./expect/equality-assertion-from-call";
import { isTautologicalExpected } from "./tautology/is-tautological-expected";

export function lint(context: Context): VisitorWithHooks {
	return {
		CallExpression(node) {
			const assertion = equalityAssertionFromCall(node);
			if (assertion === null) {
				return;
			}

			const { actual, expected, matcher } = assertion;
			if (!isTautologicalExpected(matcher, actual, expected)) {
				return;
			}

			context.report({
				data: { matcher },
				messageId: "tautological",
				node
			});
		}
	};
}
