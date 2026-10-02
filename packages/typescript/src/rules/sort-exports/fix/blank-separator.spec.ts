import { describe, expect, it } from "vitest";

import { blankSeparator } from "./blank-separator";

describe(blankSeparator, () => {
	describe("when the slice is only whitespace", () => {
		it("returns that separator", () => {
			expect.assertions(1);

			expect(blankSeparator("a\n\nb", 1, 3)).toBe("\n\n");
		});
	});

	describe("when the slice contains code", () => {
		it("returns null", () => {
			expect.assertions(1);

			expect(blankSeparator("a;b", 1, 2)).toBeNull();
		});
	});
});
