import { describe, expect, it } from "vitest";

import { patternsCanMatch } from "./patterns-can-match";

describe(patternsCanMatch, () => {
	it("matches identical literals", () => {
		expect.assertions(1);

		expect(patternsCanMatch("users/active", "users/active")).toBe(true);
	});

	it("rejects distinct literals at the same position", () => {
		expect.assertions(1);

		expect(patternsCanMatch("orders", "users")).toBe(false);
	});

	it("matches a parameter against a literal of the same length", () => {
		expect.assertions(1);

		expect(patternsCanMatch(":id", "active")).toBe(true);
	});

	it("matches a wildcard against a literal of the same length", () => {
		expect.assertions(1);

		expect(patternsCanMatch("*path", "active")).toBe(true);
	});

	it("rejects paths with a different segment count", () => {
		expect.assertions(1);

		expect(patternsCanMatch("", "active")).toBe(false);
	});

	it("matches two empty paths", () => {
		expect.assertions(1);

		expect(patternsCanMatch("", "")).toBe(true);
	});
});
