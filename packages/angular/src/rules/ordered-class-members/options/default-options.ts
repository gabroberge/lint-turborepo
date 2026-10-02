import type { Options } from "./options";

/** The default preset: Angular dependencies and signals first, then plain state, construction and behavior. */
export const DEFAULT_OPTIONS: Required<Options> = {
	groups: [
		"index-signature",
		{ categories: "inject", visibility: ["protected", "private", "public"] },
		["input", "model"],
		"output",
		"signal",
		"computed",
		"linked-signal",
		"property",
		{ categories: "constructor", newlinesWithin: "always" },
		"static-property",
		{ categories: "static-block", newlinesWithin: "always" },
		{ categories: "lifecycle", newlinesWithin: "always", order: "source" },
		{ categories: "method", newlinesWithin: "always" },
		{ categories: "static-method", newlinesWithin: "always" }
	],
	newlinesBetween: "always",
	newlinesWithin: "never",
	visibility: ["public", "protected", "private"]
};
