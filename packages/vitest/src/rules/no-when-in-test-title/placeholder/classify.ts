export type PlaceholderFix = "promote" | "wrap";

const CONDITION_PLACEHOLDER = /%(?:%|[#sdifjop])|\$#|\$[A-Za-z_]/i;
const PARAMETER_PLACEHOLDER = /%\$|%[#sdifjop]|\$#|\$[A-Za-z_][A-Za-z0-9_]*|\$\d+/iu;

export function classifyPlaceholders(condition: string, outcome: string): PlaceholderFix | null {
	if (PARAMETER_PLACEHOLDER.test(condition)) {
		if (PARAMETER_PLACEHOLDER.test(outcome) || outcome.includes("%%")) {
			return null;
		}

		return "promote";
	}

	if (CONDITION_PLACEHOLDER.test(condition)) {
		return null;
	}

	return "wrap";
}
