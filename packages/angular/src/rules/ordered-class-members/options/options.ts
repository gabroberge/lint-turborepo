import type { Category } from "./categories";
import type { Visibility } from "./visibilities";

/** Several categories sorted together as one group. */
export type CategoryList = [Category, ...Category[]];

export interface GroupObject {
	categories: Category | CategoryList;
	newlinesWithin?: Newlines;
	order?: MemberOrder;
	visibility?: Visibility[];
}

/**
 * One sorting group: a single category, several categories sorted together,
 * or an object that also overrides the group's sorting and spacing.
 */
export type GroupOption = Category | CategoryList | GroupObject;

/** How members of one group are sorted after visibility: by name, or kept in source order. */
export type MemberOrder = "alphabetical" | "source";

/** Blank-line policy: exactly one blank line, none, or leave the existing spacing alone. */
export type Newlines = "always" | "ignore" | "never";

export interface Options {
	groups?: GroupOption[];
	newlinesBetween?: Newlines;
	newlinesWithin?: Newlines;
	visibility?: Visibility[];
}
