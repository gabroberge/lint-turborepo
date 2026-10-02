import { unwrapAwaitedExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

const PLAIN_TO_CLASS = new Set(["plainToInstance", "plainToClass"]);

export type InstantiationKind = "plain" | "transform";

/** `plainToInstance` / `plainToClass`, or a `.transform` member call. */
export function instantiationKind(call: ESTree.CallExpression): InstantiationKind | null {
	const callee = unwrapAwaitedExpression(call.callee);
	if (callee.type === "Identifier" && PLAIN_TO_CLASS.has(callee.name)) {
		return "plain";
	}

	if (callee.type !== "MemberExpression" || callee.computed || callee.property.type !== "Identifier") {
		return null;
	}

	if (PLAIN_TO_CLASS.has(callee.property.name)) {
		return "plain";
	}

	if (callee.property.name === "transform") {
		return "transform";
	}

	return null;
}
