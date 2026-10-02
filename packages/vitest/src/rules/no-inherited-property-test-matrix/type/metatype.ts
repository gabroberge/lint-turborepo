import { staticKey, unwrapAwaitedExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

export type Metatype = { kind: "absent" } | { kind: "name"; name: string } | { kind: "uncertain" };

/**
 * The `metatype` identifier on a transform options object. A spread without a
 * `metatype` key, a non-object, or conflicting names cannot be tied to a class.
 */
export function metatypeOf(argument: ESTree.CallExpression["arguments"][number] | undefined): Metatype {
	if (argument === undefined) {
		return { kind: "absent" };
	}

	if (argument.type === "SpreadElement") {
		return { kind: "uncertain" };
	}

	const expression = unwrapAwaitedExpression(argument);
	if (expression.type !== "ObjectExpression") {
		return { kind: "uncertain" };
	}

	let found: string | null = null;
	let spread = false;
	for (const property of expression.properties) {
		if (property.type !== "Property") {
			spread = true;
			continue;
		}

		if (property.computed || staticKey(property.key) !== "metatype") {
			continue;
		}

		const value = unwrapAwaitedExpression(property.value);
		if (value.type !== "Identifier") {
			return { kind: "uncertain" };
		}

		if (found !== null && found !== value.name) {
			return { kind: "uncertain" };
		}

		found = value.name;
	}

	if (found !== null) {
		return { kind: "name", name: found };
	}

	if (spread) {
		return { kind: "uncertain" };
	}

	return { kind: "absent" };
}
