import { describe, expect, it } from "vitest";

import { parsedPaths } from "./parsed-paths";

describe(parsedPaths, () => {
	describe("when paths are missing", () => {
		it("returns dynamic", () => {
			expect.assertions(1);

			expect(parsedPaths(null)).toStrictEqual({ type: "dynamic" });
		});
	});

	describe("when paths are present", () => {
		it("returns those paths as static", () => {
			expect.assertions(1);

			expect(parsedPaths(["active", ":id"])).toStrictEqual({ paths: ["active", ":id"], type: "static" });
		});
	});
});
