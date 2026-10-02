/** Diagnostic messages, keyed by message id. */
export const MESSAGES = {
	extraBlankLine: "Expected {{expected}} before `{{name}}`.",
	initializationOrder:
		"Expected `{{name}}` ({{category}}) before `{{other}}` ({{otherCategory}}), but it is not reordered automatically: their initializers may depend on running in source order.",
	missingBlankLine: "Expected a blank line before `{{name}}`.",
	unordered: "Expected `{{name}}` ({{category}}) before `{{other}}` ({{otherCategory}})."
} as const;

export type MessageId = keyof typeof MESSAGES;
