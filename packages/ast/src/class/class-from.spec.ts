import { describe, expect, it } from "vitest";

import { classFrom } from "./class-from";

describe(classFrom, () => {
	it("returns the class written in the snippet", () => {
		expect.assertions(1);

		expect(classFrom("class Derived extends Base { ownField?: number; }").name?.text).toBe("Derived");
	});

	it("throws when the snippet has no class declaration", () => {
		expect.assertions(1);

		expect(() => classFrom("function extra(): void {}")).toThrow("classFrom: expected a class declaration");
	});
});
