import { identifierName, unwrapAwaitedExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import { metatypeOf } from "../type/metatype";
import { typeArgumentName } from "../type/type-argument-name";
import { instantiationKind } from "./instantiation-kind";

export interface ParsedInstantiation {
	className: string | null;
	input: ESTree.Node;
}

/**
 * The class name and plain input of a `transform` / `plainToInstance` /
 * `plainToClass` call. A missing argument, a spread, or a type-argument
 * mismatch cannot be tied to one class.
 */
export function parseInstantiation(call: ESTree.CallExpression): ParsedInstantiation | null {
	const kind = instantiationKind(call);
	if (kind === null) {
		return null;
	}

	const typeArgument = typeArgumentName(call);
	if (kind === "plain") {
		const classArgument = call.arguments[0];
		if (!classArgument || classArgument.type === "SpreadElement") {
			return null;
		}

		const input = call.arguments[1];
		if (!input || input.type === "SpreadElement") {
			return null;
		}

		const className = identifierName(unwrapAwaitedExpression(classArgument));
		if (className === null) {
			return null;
		}

		if (typeArgument !== null && typeArgument !== className) {
			return null;
		}

		return { className, input };
	}

	const input = call.arguments[0];
	if (!input || input.type === "SpreadElement") {
		return null;
	}

	const metatype = metatypeOf(call.arguments[1]);
	if (metatype.kind === "uncertain") {
		return null;
	}

	if (typeArgument !== null && metatype.kind === "name" && metatype.name !== typeArgument) {
		return null;
	}

	return {
		className: metatype.kind === "name" ? metatype.name : typeArgument,
		input
	};
}
