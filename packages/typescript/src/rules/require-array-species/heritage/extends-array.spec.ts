import { describe, expect, it } from "vitest";

import { asExpression } from "../testing/as-expression";
import { identifier } from "../testing/identifier";
import { instantiation } from "../testing/instantiation";
import { member } from "../testing/member";
import { parenthesized } from "../testing/parenthesized";
import { extendsArray } from "./extends-array";

describe(extendsArray, () => {
	it("should recognize a direct Array identifier", () => {
		expect.assertions(1);

		expect(extendsArray(identifier("Array"))).toBe(true);
	});

	it("should recognize Array<T> instantiation", () => {
		expect.assertions(1);

		expect(extendsArray(instantiation(identifier("Array")))).toBe(true);
	});

	it("should recognize a parenthesized Array identifier", () => {
		expect.assertions(1);

		expect(extendsArray(parenthesized(identifier("Array")))).toBe(true);
	});

	it("should recognize Array after a type assertion", () => {
		expect.assertions(1);

		expect(extendsArray(asExpression(identifier("Array")))).toBe(true);
	});

	it("should reject a different identifier", () => {
		expect.assertions(1);

		expect(extendsArray(identifier("Map"))).toBe(false);
	});

	it("should reject a missing super class", () => {
		expect.assertions(1);

		expect(extendsArray(null)).toBe(false);
	});

	it("should reject a member access such as globalThis.Array", () => {
		expect.assertions(1);

		expect(extendsArray(member("globalThis", "Array"))).toBe(false);
	});
});
