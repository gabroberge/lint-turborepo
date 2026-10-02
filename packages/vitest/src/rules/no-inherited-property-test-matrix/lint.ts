import type { Context, VisitorWithHooks } from "@oxlint/plugins";

import { observeTests } from "./observe/observe-test";
import { createOwnershipResolver } from "./ownership/resolver";
import type { RecognizedTest } from "./recognize/test";
import { recognizeTest } from "./recognize/test";
import { collectReports } from "./report/collect-reports";
import { absoluteFilename } from "./source/absolute-filename";

export function lint(context: Context): VisitorWithHooks {
	const tests: RecognizedTest[] = [];

	return {
		CallExpression(node) {
			const test = recognizeTest(node);
			if (test !== null) {
				tests.push(test);
			}
		},
		"Program:exit"() {
			if (tests.length === 0) {
				return;
			}

			const resolver = createOwnershipResolver(absoluteFilename(context), context.sourceCode.text);
			for (const report of collectReports(observeTests(tests), resolver)) {
				context.report({
					data: {
						owner: report.owner,
						property: report.property
					},
					messageId: "inheritedPropertyMatrix",
					node: report.node
				});
			}
		}
	};
}
