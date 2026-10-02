/**
 * Every member category the rule recognizes. A group lists one or more of
 * these; a category left out of every group sorts into a trailing group.
 */
export const CATEGORIES = [
	"index-signature",
	"inject",
	"input",
	"model",
	"output",
	"signal",
	"computed",
	"linked-signal",
	"property",
	"constructor",
	"static-property",
	"static-block",
	"lifecycle",
	"method",
	"static-method"
] as const;

export type Category = (typeof CATEGORIES)[number];
