import type { RuleOptionsSchema } from "@oxlint/plugins";

import { CATEGORIES } from "./categories";
import { VISIBILITIES } from "./visibilities";

const category = { enum: [...CATEGORIES], type: "string" };
const categoryList = { items: category, minItems: 1, type: "array", uniqueItems: true };
const newlines = { enum: ["always", "ignore", "never"], type: "string" };
const visibility = {
	items: { enum: [...VISIBILITIES], type: "string" },
	maxItems: VISIBILITIES.length,
	type: "array",
	uniqueItems: true
};

export const OPTIONS_SCHEMA: RuleOptionsSchema = [
	{
		additionalProperties: false,
		properties: {
			groups: {
				description: "Sorting groups, in order. A category missing from every group sorts last.",
				items: {
					anyOf: [
						category,
						categoryList,
						{
							additionalProperties: false,
							properties: {
								categories: { anyOf: [category, categoryList] },
								newlinesWithin: newlines,
								order: { enum: ["alphabetical", "source"], type: "string" },
								visibility
							},
							required: ["categories"],
							type: "object"
						}
					]
				},
				type: "array"
			},
			newlinesBetween: { ...newlines, description: "Blank lines between members of different groups." },
			newlinesWithin: { ...newlines, description: "Blank lines between members of the same group." },
			visibility: { ...visibility, description: "Accessibility order inside every group." }
		},
		type: "object"
	}
];
