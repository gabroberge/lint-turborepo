import { describe, expect, it } from "vitest";

import { compareSwallowedMethod } from "./compare-swallowed-method";

describe(compareSwallowedMethod, () => {
	it("places a concrete method before ALL", () => {
		expect.assertions(1);

		expect(compareSwallowedMethod("GET", "ALL")).toBeLessThan(0);
	});

	it("places HEAD before GET", () => {
		expect.assertions(1);

		expect(compareSwallowedMethod("HEAD", "GET")).toBeLessThan(0);
	});

	it("leaves unrelated methods tied", () => {
		expect.assertions(1);

		expect(compareSwallowedMethod("POST", "GET")).toBe(0);
	});
});
