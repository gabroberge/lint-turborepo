import type { FunctionNode } from "@gabroberge/oxlint-estree";

export function rowParameterName(fn: FunctionNode): string | null {
	const parameter = fn.params[0];
	if (!parameter) {
		return null;
	}

	if (parameter.type === "Identifier") {
		return parameter.name;
	}

	if (parameter.type === "AssignmentPattern" && parameter.left.type === "Identifier") {
		return parameter.left.name;
	}

	return null;
}
