import type { ESTree } from "@oxlint/plugins";
import { describe, expect, it } from "vitest";

import { identifier } from "../testing/identifier";
import { stringLiteral } from "../testing/string-literal";
import { leadingWhenTitle } from "./leading-when-title";

describe(leadingWhenTitle, () => {
	describe("readable title", () => {
		describe("when the first word is when", () => {
			it("returns the argument", () => {
				expect.assertions(1);

				const title = stringLiteral("when the account is missing");

				expect(leadingWhenTitle(title)).toBe(title);
			});
		});

		describe("when the title is parenthesized", () => {
			it("returns the parenthesized argument", () => {
				expect.assertions(1);

				const title = {
					expression: stringLiteral("when the account is missing"),
					type: "ParenthesizedExpression"
				} as ESTree.ParenthesizedExpression;

				expect(leadingWhenTitle(title)).toBe(title);
			});
		});
	});

	describe("unreadable title", () => {
		it("returns null for a missing argument", () => {
			expect.assertions(1);

			expect(leadingWhenTitle(undefined)).toBeNull();
		});

		it("returns null for a spread argument", () => {
			expect.assertions(1);

			const title = {
				argument: identifier("titles"),
				type: "SpreadElement"
			} as ESTree.SpreadElement;

			expect(leadingWhenTitle(title)).toBeNull();
		});

		it("returns null for an identifier", () => {
			expect.assertions(1);

			expect(leadingWhenTitle(identifier("SomeClass"))).toBeNull();
		});
	});
});
