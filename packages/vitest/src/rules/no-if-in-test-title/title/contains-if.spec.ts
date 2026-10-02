import type { ESTree } from "@oxlint/plugins";
import { describe, expect, it } from "vitest";

import { identifier } from "../testing/identifier";
import { templateTitle } from "../testing/template-title";
import { title } from "../testing/title";
import { titleContainsIf } from "./contains-if";

describe(titleContainsIf, () => {
	describe("standalone word", () => {
		it.each(["if", "If", "IF", "iF"])("should match %s as a token", (word) => {
			expect.assertions(1);

			expect(titleContainsIf(title(`returns false ${word} the value is invalid`))).toBe(true);
		});
	});

	describe("embedded letters", () => {
		it.each(["diff", "verify", "iff"])("should ignore %s", (word) => {
			expect.assertions(1);

			expect(titleContainsIf(title(`should ${word} the result`))).toBe(false);
		});
	});

	describe("template title", () => {
		it("should match a static cooked segment", () => {
			expect.assertions(1);

			expect(titleContainsIf(templateTitle("returns false if the value is invalid"))).toBe(true);
		});

		it("should ignore a token that exists only in an interpolation", () => {
			expect.assertions(1);

			expect(titleContainsIf(templateTitle("accepts ", [identifier("name")]))).toBe(false);
		});
	});

	describe("wrapped title", () => {
		it("should match a parenthesized literal", () => {
			expect.assertions(1);

			const parenthesized = {
				expression: title("returns false if the value is invalid"),
				type: "ParenthesizedExpression"
			} as ESTree.ParenthesizedExpression;

			expect(titleContainsIf(parenthesized)).toBe(true);
		});

		it("should match an as-const literal", () => {
			expect.assertions(1);

			const asConstLiteral = {
				expression: title("returns false if the value is invalid"),
				type: "TSAsExpression"
			} as ESTree.TSAsExpression;

			expect(titleContainsIf(asConstLiteral)).toBe(true);
		});
	});

	describe("unreadable title", () => {
		it("should ignore an identifier", () => {
			expect.assertions(1);

			expect(titleContainsIf(identifier("SomeClass"))).toBe(false);
		});
	});
});
