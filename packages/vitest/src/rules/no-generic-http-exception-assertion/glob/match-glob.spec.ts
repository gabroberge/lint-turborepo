import { describe, expect, it } from "vitest";

import { matchGlob } from "./match-glob";

describe(matchGlob, () => {
	it("should treat **/ as an optional directory prefix", () => {
		expect.assertions(2);

		expect(matchGlob("handler.spec.ts", "**/*.spec.ts")).toBe(true);
		expect(matchGlob("src/handler.spec.ts", "**/*.spec.ts")).toBe(true);
	});

	it("should match the basename when the full path does not match the pattern", () => {
		expect.assertions(1);

		expect(matchGlob("src/handler.spec.ts", "*.spec.ts")).toBe(true);
	});

	it("should not match a different suffix", () => {
		expect.assertions(1);

		expect(matchGlob("handler.filter.ts", "**/*.spec.ts")).toBe(false);
	});
});
