import type { Context } from "@oxlint/plugins";

import type { Category } from "./categories";
import { DEFAULT_OPTIONS } from "./default-options";
import { groupObject } from "./group-object";
import type { Options } from "./options";
import type { ResolvedGroup, ResolvedOptions } from "./resolved-options";
import { withoutOverrides } from "./without-overrides";

/**
 * Turn the configured groups into a lookup from category to group. A
 * category listed twice belongs to its first group. Categories listed
 * nowhere share one trailing group. With the default groups, a top-level
 * `visibility` or `newlinesWithin` the user sets replaces the default
 * groups' own settings, so it applies everywhere.
 */
export function resolveOptions(context: Context): ResolvedOptions {
	const raw = (context.options[0] ?? {}) as Options;
	const visibility = raw.visibility ?? DEFAULT_OPTIONS.visibility;
	const newlinesWithin = raw.newlinesWithin ?? DEFAULT_OPTIONS.newlinesWithin;
	const groups = new Map<Category, ResolvedGroup>();
	const options = raw.groups ?? DEFAULT_OPTIONS.groups;

	for (const [index, option] of options.entries()) {
		const group = raw.groups === undefined ? withoutOverrides(groupObject(option), raw) : groupObject(option);
		const categories = typeof group.categories === "string" ? [group.categories] : group.categories;
		const resolved: ResolvedGroup = {
			index,
			newlinesWithin: group.newlinesWithin ?? newlinesWithin,
			order: group.order ?? "alphabetical",
			visibility: group.visibility ?? visibility
		};
		for (const category of categories) {
			if (!groups.has(category)) {
				groups.set(category, resolved);
			}
		}
	}

	const fallback: ResolvedGroup = {
		index: options.length,
		newlinesWithin,
		order: "alphabetical",
		visibility
	};

	return {
		groupOf: (category) => groups.get(category) ?? fallback,
		newlinesBetween: raw.newlinesBetween ?? DEFAULT_OPTIONS.newlinesBetween
	};
}
