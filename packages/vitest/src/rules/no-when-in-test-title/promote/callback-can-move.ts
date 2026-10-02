import type { FunctionNode } from "@gabroberge/oxlint-estree";
import { containsNodeType } from "@gabroberge/oxlint-estree";

import { hasComment } from "../source/has-comment";

/**
 * Whether this callback can be rewritten as the inner `it` / `test` when the
 * dataset moves to `describe`. Comments in the header, `this`, defaults,
 * decorators, generators, type syntax, and a `.for` rest parameter refuse.
 */
export function callbackCanMove(callback: FunctionNode, source: string, factoryName: "each" | "for"): boolean {
	if (callback.body === null || callback.typeParameters != null || callback.returnType != null) {
		return false;
	}

	if (callback.type === "FunctionExpression" && callback.generator) {
		return false;
	}

	if (hasComment(source.slice(callback.range[0], callback.body.range[0])) && callback.params.length === 0) {
		return false;
	}

	for (const param of callback.params) {
		if (param.type === "TSParameterProperty") {
			return false;
		}

		if (param.type === "Identifier" && param.name === "this") {
			return false;
		}

		if (factoryName === "for" && param.type === "RestElement") {
			return false;
		}

		if (containsNodeType(param, "AssignmentPattern")) {
			return false;
		}

		if ("decorators" in param && Array.isArray(param.decorators) && param.decorators.length > 0) {
			return false;
		}
	}

	if (callback.params.length > 0) {
		const firstParam = callback.params[0];
		if (firstParam === undefined) {
			return false;
		}

		const lastParam = callback.params[callback.params.length - 1];
		if (lastParam === undefined) {
			return false;
		}

		const header = source.slice(callback.range[0], firstParam.range[0]);
		if (hasComment(header)) {
			return false;
		}

		const trailer = source.slice(lastParam.range[1], callback.body.range[0]);
		if (hasComment(trailer)) {
			return false;
		}
	}

	return true;
}
