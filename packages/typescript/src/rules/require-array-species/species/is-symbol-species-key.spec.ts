import { describe, expect, it } from "vitest";

import { computedMember } from "../testing/computed-member";
import { identifier } from "../testing/identifier";
import { member } from "../testing/member";
import { parenthesized } from "../testing/parenthesized";
import { isSymbolSpeciesKey } from "./is-symbol-species-key";

describe(isSymbolSpeciesKey, () => {
	it("should recognize Symbol.species", () => {
		expect.assertions(1);

		expect(isSymbolSpeciesKey(member("Symbol", "species"))).toBe(true);
	});

	it("should recognize parenthesized Symbol.species", () => {
		expect.assertions(1);

		expect(isSymbolSpeciesKey(parenthesized(member("Symbol", "species")))).toBe(true);
	});

	it("should reject a different well-known symbol", () => {
		expect.assertions(1);

		expect(isSymbolSpeciesKey(member("Symbol", "iterator"))).toBe(false);
	});

	it("should reject a non-computed species identifier", () => {
		expect.assertions(1);

		expect(isSymbolSpeciesKey(identifier("species"))).toBe(false);
	});

	it("should reject computed Symbol access", () => {
		expect.assertions(1);

		expect(isSymbolSpeciesKey(computedMember("Symbol", "species"))).toBe(false);
	});
});
