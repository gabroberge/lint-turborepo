import { describe, expect, it } from "vitest";

import { methodsOverlap } from "./methods-overlap";

describe(methodsOverlap, () => {
	it("treats the same method as overlapping", () => {
		expect.assertions(1);

		expect(methodsOverlap("GET", "GET")).toBe(true);
	});

	it("treats ALL as overlapping every method", () => {
		expect.assertions(1);

		expect(methodsOverlap("ALL", "DELETE")).toBe(true);
	});

	it("treats GET and HEAD as overlapping", () => {
		expect.assertions(1);

		expect(methodsOverlap("GET", "HEAD")).toBe(true);
	});

	it("treats distinct concrete methods as independent", () => {
		expect.assertions(1);

		expect(methodsOverlap("GET", "POST")).toBe(false);
	});
});
