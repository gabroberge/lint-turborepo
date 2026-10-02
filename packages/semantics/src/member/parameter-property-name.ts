import type { ESTree } from "@oxlint/plugins";

/**
 * The member a constructor parameter declares: the name of a parameter
 * property (`private readonly name`, defaulted or not), or `null` for a
 * plain parameter.
 */
export function parameterPropertyName(parameter: ESTree.Function["params"][number]): string | null {
	const binding =
		parameter.type === "TSParameterProperty" && parameter.parameter.type === "AssignmentPattern"
			? parameter.parameter.left
			: parameter.type === "TSParameterProperty"
				? parameter.parameter
				: null;
	return binding?.type === "Identifier" ? binding.name : null;
}
