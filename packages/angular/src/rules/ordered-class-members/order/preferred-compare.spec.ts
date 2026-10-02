import { describe, expect, it } from "vitest";

import type { ClassMember } from "../member/class-member";
import type { Options } from "../options/options";
import { compareWith } from "../testing/compare-with";
import { memberStub } from "../testing/member-stub";
import { preferredCompare } from "./preferred-compare";

interface Case {
	first: Partial<ClassMember>;
	name: string;
	options?: Options;
	second: Partial<ClassMember>;
}

/** Each case lists the member expected first, at the higher source index so source order alone would not explain it. */
const CASES: Case[] = [
	{ first: { category: "inject" }, name: "an earlier group", second: { category: "property" } },
	{ first: { visibility: "public" }, name: "a default visibility", second: { visibility: "private" } },
	{
		first: { category: "inject", visibility: "protected" },
		name: "the visibility override of a group",
		second: { category: "inject", visibility: "public" }
	},
	{
		first: { visibility: "private" },
		name: "a configured visibility",
		options: { visibility: ["private", "public"] },
		second: { visibility: "protected" }
	},
	{ first: { key: "alpha" }, name: "a name", second: { key: "beta" } },
	{ first: { key: "Alpha" }, name: "a name ignoring case", second: { key: "beta" } },
	{ first: { key: "alpha" }, name: "a lowercase name before a later capital", second: { key: "Beta" } },
	{ first: { key: "A" }, name: "a capital on an exact case-insensitive tie", second: { key: "a" } },
	{ first: { key: "#alpha" }, name: "a private name ignoring the hash", second: { key: "beta" } },
	{ first: { key: "alpha" }, name: "a public name before a later private one", second: { key: "#beta" } },
	{ first: { key: "item2" }, name: "names compared as text", second: { key: "item3" } },
	{
		first: { category: "method" },
		name: "a listed category before an unlisted one",
		options: { groups: ["method"] },
		second: { category: "property" }
	}
];

describe(preferredCompare, () => {
	it.each(CASES)("should order by $name", ({ first, options, second }) => {
		expect.assertions(2);

		const compare = compareWith(options);
		const preferred = memberStub({ ...first, index: 1 });
		const other = memberStub({ ...second, index: 0 });

		expect(compare(preferred, other)).toBeLessThan(0);
		expect(compare(other, preferred)).toBeGreaterThan(0);
	});

	it("should keep source order in a source-ordered group", () => {
		expect.assertions(1);

		const compare = compareWith();
		const first = memberStub({ category: "lifecycle", index: 0, key: "ngOnInit" });
		const second = memberStub({ category: "lifecycle", index: 1, key: "ngAfterViewInit" });

		expect(compare(first, second)).toBeLessThan(0);
	});

	it("should fall back to source order for equal names", () => {
		expect.assertions(2);

		const compare = compareWith();
		const first = memberStub({ index: 0, key: "same" });
		const second = memberStub({ index: 3, key: "same" });

		expect(compare(first, second)).toBeLessThan(0);
		expect(compare(first, first)).toBe(0);
	});

	it("should sort a computed key by its label", () => {
		expect.assertions(1);

		const compare = compareWith();
		const computed = memberStub({ index: 1, key: null, label: "[a]" });
		const named = memberStub({ index: 0, key: "b" });

		expect(compare(computed, named)).toBeLessThan(0);
	});
});
