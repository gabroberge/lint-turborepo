import { describe, expect, it } from "vitest";

import { isDtoSpecFilename } from "./is-dto-spec";

describe(isDtoSpecFilename, () => {
	describe("when the path ends with .dto.spec.ts", () => {
		it("returns true", () => {
			expect.assertions(2);

			expect(isDtoSpecFilename("example.dto.spec.ts")).toBe(true);
			expect(isDtoSpecFilename("src/example.dto.spec.ts")).toBe(true);
		});
	});

	describe("when the path uses Windows separators", () => {
		it("returns true for a dto spec", () => {
			expect.assertions(1);

			expect(isDtoSpecFilename("src\\example.dto.spec.ts")).toBe(true);
		});
	});

	describe("when the path is not a dto spec", () => {
		it("returns false", () => {
			expect.assertions(3);

			expect(isDtoSpecFilename("example.service.spec.ts")).toBe(false);
			expect(isDtoSpecFilename("example.dto.ts")).toBe(false);
			expect(isDtoSpecFilename("example.spec.ts")).toBe(false);
		});
	});
});
