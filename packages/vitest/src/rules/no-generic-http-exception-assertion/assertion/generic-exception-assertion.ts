import type { ESTree } from "@oxlint/plugins";

import type { Binding } from "../import/collect-import";
import { isNegated } from "./is-negated";
import { isTypeOnlyGenericException } from "./is-type-only-generic-exception";
import { matcherObject } from "./matcher-object";

/**
 * Returns the first matcher argument when the call is a type-only assertion of
 * a Nest HTTP exception: a class reference, a namespace member, or a zero-arg
 * `new`. Message/regex literals and constructed instances with arguments are
 * ignored.
 */
export function genericExceptionAssertionArgument(
	node: ESTree.CallExpression,
	bindings: Map<string, Binding>,
	matchers: ReadonlySet<string>
): ESTree.Expression | null {
	const object = matcherObject(node, matchers);
	if (object === null || isNegated(object)) {
		return null;
	}

	const argument = node.arguments[0];
	if (argument === undefined || argument.type === "SpreadElement") {
		return null;
	}

	if (!isTypeOnlyGenericException(argument, bindings)) {
		return null;
	}

	return argument;
}
