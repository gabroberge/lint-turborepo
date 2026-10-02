import { describe, expect, it } from "vitest";

import { lineStart } from "./line-start";

describe(lineStart, () => {
	describe("when the index is already at a line start", () => {
		it("returns that index", () => {
			expect.assertions(1);

			expect(lineStart("ab\ncd", 3)).toBe(3);
		});
	});

	describe("when the index is inside a line", () => {
		it("returns the start of that line", () => {
			expect.assertions(1);

			expect(lineStart("ab\ncd", 4)).toBe(3);
		});
	});
});
