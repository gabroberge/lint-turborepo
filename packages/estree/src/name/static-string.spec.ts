import type { ESTree } from "@oxlint/plugins";
import { describe, expect, it } from "vitest";

import { numericLiteral } from "../testing/numeric-literal";
import { parenthesized } from "../testing/parenthesized";
import { stringLiteral } from "../testing/string-literal";
import { template } from "../testing/template";
import { staticString } from "./static-string";

describe(staticString, () => {
	describe("string literal", () => {
		it("should return the value of a string literal", () => {
			expect.assertions(1);

			expect(staticString(stringLiteral("users"))).toBe("users");
		});
	});

	describe("transparent wrapper", () => {
		it("should unwrap a transparent wrapper before reading the string", () => {
			expect.assertions(1);

			expect(staticString(parenthesized(stringLiteral("users")))).toBe("users");
		});
	});

	describe("template literal", () => {
		it("should return the cooked text of a template without expressions", () => {
			expect.assertions(1);

			expect(staticString(template("users", "users"))).toBe("users");
		});

		it("should fall back to the raw text when the cooked value is null", () => {
			expect.assertions(1);

			expect(staticString(template(null, "\\u"))).toBe("\\u");
		});

		it("should keep an empty cooked string", () => {
			expect.assertions(1);

			expect(staticString(template("", "raw"))).toBe("");
		});

		it("should return null for a template that contains an expression", () => {
			expect.assertions(1);

			expect(staticString(template("users", "users", [stringLiteral("id")]))).toBeNull();
		});
	});

	describe("unsupported expression", () => {
		it("should return null for a numeric literal", () => {
			expect.assertions(1);

			expect(staticString(numericLiteral(1))).toBeNull();
		});

		it("should return null for an identifier", () => {
			expect.assertions(1);

			expect(staticString({ name: "path", type: "Identifier" } as ESTree.IdentifierReference)).toBeNull();
		});
	});
});
