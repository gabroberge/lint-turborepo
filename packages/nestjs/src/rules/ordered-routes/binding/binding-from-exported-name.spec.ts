import { describe, expect, it } from "vitest";

import { bindingFromExportedName } from "./binding-from-exported-name";

describe(bindingFromExportedName, () => {
	describe("http decorator exports", () => {
		it.each([
			{ exported: "All", method: "ALL" },
			{ exported: "Delete", method: "DELETE" },
			{ exported: "Get", method: "GET" },
			{ exported: "Head", method: "HEAD" },
			{ exported: "Options", method: "OPTIONS" },
			{ exported: "Patch", method: "PATCH" },
			{ exported: "Post", method: "POST" },
			{ exported: "Put", method: "PUT" },
			{ exported: "QueryMethod", method: "QUERY" },
			{ exported: "Search", method: "SEARCH" }
		] as const)("maps $exported to $method", ({ exported, method }) => {
			expect.assertions(1);

			expect(bindingFromExportedName(exported)).toStrictEqual({ method, type: "method" });
		});
	});

	it("maps Controller to a controller binding", () => {
		expect.assertions(1);

		expect(bindingFromExportedName("Controller")).toStrictEqual({ type: "controller" });
	});

	it("rejects an unknown export", () => {
		expect.assertions(1);

		expect(bindingFromExportedName("Injectable")).toBeNull();
	});

	describe("when the name is missing", () => {
		it("returns null", () => {
			expect.assertions(1);

			expect(bindingFromExportedName(null)).toBeNull();
		});
	});
});
