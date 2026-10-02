import type { Context, VisitorWithHooks } from "@oxlint/plugins";

import { isDtoSpecFilename } from "./filename/is-dto-spec";
import { analyzeSuite } from "./suite/analyze-suite";
import { createSuiteExit } from "./suite/suite-exit";

export function lint(context: Context): VisitorWithHooks {
	if (!isDtoSpecFilename(context.filename)) {
		return {};
	}

	const suites = createSuiteExit((call, callback) => {
		for (const report of analyzeSuite(context.sourceCode, call, callback)) {
			context.report(report);
		}
	});

	return {
		...suites.visitors
	};
}
