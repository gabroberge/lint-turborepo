import { unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import type { HttpMethod } from "../../../order-routes";
import type { Binding } from "../binding/binding-from-exported-name";
import { parsePaths } from "./parse-paths";
import type { ParsedPaths } from "./parsed-paths";
import { resolveDecorator } from "./resolve-decorator";

export interface HttpRoute {
	method: HttpMethod;
	paths: ParsedPaths;
}

export function httpRouteFromDecorator(
	decorator: ESTree.Decorator,
	bindings: ReadonlyMap<string, Binding>
): HttpRoute | null {
	const expression = unwrapExpression(decorator.expression);
	if (expression.type !== "CallExpression") {
		return null;
	}

	const binding = resolveDecorator(expression.callee, bindings);
	if (binding?.type !== "method") {
		return null;
	}

	return { method: binding.method, paths: parsePaths(expression.arguments) };
}
