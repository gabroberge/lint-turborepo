import type { Context, VisitorWithHooks } from "@oxlint/plugins";

import { redundantWiringRemovals } from "./removal/redundant-wiring-removals";
import { createOutermostSuite } from "./suite/outermost-suite";
import { createExecutableTests } from "./test/executable-tests";

export function lint(context: Context): VisitorWithHooks {
	const suite = createOutermostSuite();
	const tests = createExecutableTests();

	return {
		...suite.visitors,
		...tests.visitors,
		CallExpression(node) {
			suite.note(node);
			tests.record(node, suite.outermost());
		},
		"Program:exit"() {
			for (const removal of redundantWiringRemovals(context.sourceCode.text, tests.recorded())) {
				context.report({
					fix(fixer) {
						if (removal.range === null) {
							return null;
						}

						return fixer.removeRange(removal.range);
					},
					messageId: "redundantWiringTest",
					node: removal.node
				});
			}
		}
	};
}
