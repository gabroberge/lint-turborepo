import { describe, expect, it } from "vitest";

import { resolveTestOptions } from "../testing/resolve-test-options";
import { CATEGORIES } from "./categories";
import { resolveOptions } from "./resolve-options";

describe(resolveOptions, () => {
	it("should resolve the default preset", () => {
		expect.assertions(4);

		const options = resolveTestOptions();

		expect(options.newlinesBetween).toBe("always");
		expect(options.groupOf("property")).toStrictEqual({
			index: 7,
			newlinesWithin: "never",
			order: "alphabetical",
			visibility: ["public", "protected", "private"]
		});
		expect(options.groupOf("inject").visibility).toStrictEqual(["protected", "private", "public"]);
		expect(options.groupOf("lifecycle")).toMatchObject({ newlinesWithin: "always", order: "source" });
	});

	it("should place every category in a distinct default group except combined ones", () => {
		expect.assertions(2);

		const options = resolveTestOptions();
		const indexes = CATEGORIES.map((category) => options.groupOf(category).index);

		expect(options.groupOf("input")).toBe(options.groupOf("model"));
		expect(new Set(indexes).size).toBe(CATEGORIES.length - 1);
	});

	it("should keep a category in the first group listing it", () => {
		expect.assertions(2);

		const options = resolveTestOptions({ groups: ["method", ["property", "method"]] });

		expect(options.groupOf("method").index).toBe(0);
		expect(options.groupOf("property").index).toBe(1);
	});

	it("should share one group between combined categories", () => {
		expect.assertions(1);

		const options = resolveTestOptions({ groups: [{ categories: ["signal", "computed"], order: "source" }] });

		expect(options.groupOf("computed")).toBe(options.groupOf("signal"));
	});

	it("should put unlisted categories in one trailing group", () => {
		expect.assertions(2);

		const options = resolveTestOptions({ groups: ["method", "property"] });

		expect(options.groupOf("inject").index).toBe(2);
		expect(options.groupOf("signal")).toBe(options.groupOf("inject"));
	});

	it("should apply top-level settings to groups without overrides", () => {
		expect.assertions(2);

		const options = resolveTestOptions({
			groups: ["property", { categories: "method", newlinesWithin: "ignore", visibility: ["private"] }],
			newlinesBetween: "never",
			newlinesWithin: "always",
			visibility: ["private", "public"]
		});

		expect(options.groupOf("property")).toStrictEqual({
			index: 0,
			newlinesWithin: "always",
			order: "alphabetical",
			visibility: ["private", "public"]
		});
		expect(options.groupOf("method")).toMatchObject({ newlinesWithin: "ignore", visibility: ["private"] });
	});
});
