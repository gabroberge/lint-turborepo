import { describe, expect, it } from "vitest";

import { arraySpread } from "../testing/array-spread";
import { identifier } from "../testing/identifier";
import { member } from "../testing/member";
import { numeric } from "../testing/numeric";
import { objectSpread } from "../testing/object-spread";
import { objectSpreadPlus } from "../testing/object-spread-plus";
import { isTautologicalExpected } from "./is-tautological-expected";

describe(isTautologicalExpected, () => {
	describe("identical safe expressions", () => {
		it("should treat the same identifier as tautological for every equality matcher", () => {
			expect.assertions(3);

			const dto = identifier("dto");

			expect(isTautologicalExpected("toBe", dto, dto)).toBe(true);
			expect(isTautologicalExpected("toEqual", dto, dto)).toBe(true);
			expect(isTautologicalExpected("toStrictEqual", dto, dto)).toBe(true);
		});

		it("should treat the same member path as tautological", () => {
			expect.assertions(1);

			const path = member("result", "data");

			expect(isTautologicalExpected("toEqual", path, path)).toBe(true);
		});

		it("should ignore different identifiers", () => {
			expect.assertions(1);

			expect(isTautologicalExpected("toEqual", identifier("actual"), identifier("expected"))).toBe(false);
		});
	});

	describe("sole spread of the actual", () => {
		it("should treat an object spread of the same identifier as tautological for toEqual", () => {
			expect.assertions(1);

			const dto = identifier("dto");

			expect(isTautologicalExpected("toEqual", dto, objectSpread(dto))).toBe(true);
		});

		it("should treat an array spread of the same identifier as tautological for toEqual", () => {
			expect.assertions(1);

			const items = identifier("items");

			expect(isTautologicalExpected("toEqual", items, arraySpread(items))).toBe(true);
		});

		it("should ignore a sole spread for toBe", () => {
			expect.assertions(1);

			const dto = identifier("dto");

			expect(isTautologicalExpected("toBe", dto, objectSpread(dto))).toBe(false);
		});

		it("should ignore a spread that adds another property", () => {
			expect.assertions(1);

			const dto = identifier("dto");

			expect(isTautologicalExpected("toEqual", dto, objectSpreadPlus(dto))).toBe(false);
		});

		it("should ignore spreading a literal", () => {
			expect.assertions(1);

			const one = numeric(1);

			expect(isTautologicalExpected("toEqual", one, objectSpread(one))).toBe(false);
		});
	});
});
