import { describe, expect, it } from "vitest";

import { array } from "../testing/array";
import { asConst } from "../testing/as-const";
import { call } from "../testing/call";
import { identifier } from "../testing/identifier";
import { numeric } from "../testing/numeric";
import { spread } from "../testing/spread";
import { staticCaseCount } from "./static-case-count";

describe(staticCaseCount, () => {
	it("returns 1 for a one-element array", () => {
		expect.assertions(1);

		expect(staticCaseCount(array(numeric(1)))).toBe(1);
	});

	it("returns 1 for a one-row nested array", () => {
		expect.assertions(1);

		expect(staticCaseCount(array(array(numeric(42))))).toBe(1);
	});

	it("returns 1 for a table wrapped in as const", () => {
		expect.assertions(1);

		expect(staticCaseCount(asConst(array(numeric(1))))).toBe(1);
	});

	it("returns 0 for an empty array", () => {
		expect.assertions(1);

		expect(staticCaseCount(array())).toBe(0);
	});

	it("returns the element count for several cases", () => {
		expect.assertions(1);

		expect(staticCaseCount(array(numeric(1), numeric(2)))).toBe(2);
	});

	it("returns null for an identifier table", () => {
		expect.assertions(1);

		expect(staticCaseCount(identifier("cases"))).toBeNull();
	});

	it("returns null for a function-call table", () => {
		expect.assertions(1);

		expect(staticCaseCount(call(identifier("getCases")))).toBeNull();
	});

	it("returns null for a spread argument", () => {
		expect.assertions(1);

		expect(staticCaseCount(spread("cases"))).toBeNull();
	});

	it("returns null for a spread inside the array", () => {
		expect.assertions(1);

		expect(staticCaseCount(array(spread("cases")))).toBeNull();
	});

	it("returns null when the table is missing", () => {
		expect.assertions(1);

		expect(staticCaseCount(undefined)).toBeNull();
	});
});
