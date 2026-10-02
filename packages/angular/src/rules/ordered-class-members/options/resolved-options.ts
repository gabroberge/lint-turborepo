import type { Category } from "./categories";
import type { MemberOrder, Newlines } from "./options";
import type { Visibility } from "./visibilities";

export interface ResolvedGroup {
	index: number;
	newlinesWithin: Newlines;
	order: MemberOrder;
	visibility: readonly Visibility[];
}

export interface ResolvedOptions {
	groupOf: (category: Category) => ResolvedGroup;
	newlinesBetween: Newlines;
}
