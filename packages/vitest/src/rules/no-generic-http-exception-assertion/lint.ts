import type { Context, ESTree, VisitorWithHooks } from "@oxlint/plugins";

import { genericExceptionAssertionArgument } from "./assertion/generic-exception-assertion";
import { diagnosticFor } from "./diagnostic";
import { matchesAny } from "./glob/matches-any";
import { normalizePath } from "./glob/normalize-path";
import type { Binding } from "./import/collect-import";
import { collectImport } from "./import/collect-import";
import { resolveOptions } from "./options/resolve-options";

export function lint(context: Context): VisitorWithHooks {
	const options = resolveOptions(context);
	const filename = normalizePath(context.filename);

	if (!matchesAny(filename, options.testFilePatterns)) {
		return {};
	}

	if (matchesAny(filename, options.exemptFilePatterns)) {
		return {};
	}

	const diagnostic = diagnosticFor(filename);
	const bindings = new Map<string, Binding>();

	return {
		CallExpression(node: ESTree.CallExpression) {
			const argument = genericExceptionAssertionArgument(node, bindings, options.matchers);
			if (argument === null) {
				return;
			}

			context.report({
				messageId: diagnostic,
				node: argument
			});
		},
		ImportDeclaration(node: ESTree.ImportDeclaration) {
			collectImport(node, bindings, options.exceptionNames);
		}
	};
}
