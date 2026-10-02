import { describe, expect, it } from "vitest";

import { comparePaths } from "./compare-paths";

describe(comparePaths, () => {
	it("ignores parameter names", () => {
		expect.assertions(1);

		expect(comparePaths(":id", ":slug")).toBe(0);
	});

	it("ignores wildcard names", () => {
		expect.assertions(1);

		expect(comparePaths("*path", "{*rest}")).toBe(0);
	});

	it("orders shorter paths, then static segments, then parameters, then wildcards", () => {
		expect.assertions(1);

		const paths = ["users", "users/*path", "users/:id", "users/:id/details", "users/active"];

		expect(paths.toSorted(comparePaths)).toStrictEqual([
			"users",
			"users/active",
			"users/:id",
			"users/:id/details",
			"users/*path"
		]);
	});

	it("keeps distinct path prefixes in their original order", () => {
		expect.assertions(1);

		expect(comparePaths("orders/list", "users/me")).toBe(0);
	});

	it("keeps distinct literals in their original order", () => {
		expect.assertions(1);

		expect(comparePaths("users/active", "users/banned")).toBe(0);
	});

	it("places an empty path before a literal", () => {
		expect.assertions(1);

		expect(comparePaths("", "active")).toBeLessThan(0);
	});

	it("places an empty path before a parameter", () => {
		expect.assertions(1);

		expect(comparePaths("", ":id")).toBeLessThan(0);
	});

	it("places a wildcard after an empty path", () => {
		expect.assertions(1);

		expect(comparePaths("*path", "")).toBeGreaterThan(0);
	});

	it("places an empty path before a brace wildcard", () => {
		expect.assertions(1);

		expect(comparePaths("", "{*path}")).toBeLessThan(0);
	});
});
