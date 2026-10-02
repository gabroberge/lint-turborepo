import { describe, expect, it } from "vitest";

import { identifier } from "../testing/identifier";
import { stringLiteral } from "../testing/string-literal";
import { template } from "../testing/template";
import { startsWithWhen } from "./starts-with-when";

describe(startsWithWhen, () => {
	describe("string literal", () => {
		describe("when the first word is when", () => {
			it("returns true", () => {
				expect.assertions(1);

				expect(startsWithWhen(stringLiteral("when the account is missing"))).toBe(true);
			});
		});

		describe("when When is capitalized", () => {
			it("returns true", () => {
				expect.assertions(1);

				expect(startsWithWhen(stringLiteral("When the account is missing"))).toBe(true);
			});
		});

		describe("when the title has leading whitespace", () => {
			it("returns true", () => {
				expect.assertions(1);

				expect(startsWithWhen(stringLiteral(" when the account is missing"))).toBe(true);
			});
		});

		describe("when the title is the word when alone", () => {
			it("returns true", () => {
				expect.assertions(1);

				expect(startsWithWhen(stringLiteral("when"))).toBe(true);
			});
		});

		describe("when the word is whenever", () => {
			it("returns false", () => {
				expect.assertions(1);

				expect(startsWithWhen(stringLiteral("whenever the cache is warm"))).toBe(false);
			});
		});

		describe("when the word is whenfoo", () => {
			it("returns false", () => {
				expect.assertions(1);

				expect(startsWithWhen(stringLiteral("whenfoo parser"))).toBe(false);
			});
		});

		describe("when when is not the first word", () => {
			it("returns false", () => {
				expect.assertions(1);

				expect(startsWithWhen(stringLiteral("Accounts when empty"))).toBe(false);
			});
		});
	});

	describe("template literal", () => {
		describe("when the leading cooked text starts with when", () => {
			it("returns true", () => {
				expect.assertions(1);

				expect(startsWithWhen(template("when the account is missing"))).toBe(true);
			});
		});

		describe("when when is before an interpolation", () => {
			it("returns true", () => {
				expect.assertions(1);

				expect(startsWithWhen(template("when ", [identifier("reason")]))).toBe(true);
			});
		});

		describe("when an interpolation comes before when", () => {
			it("returns false", () => {
				expect.assertions(1);

				expect(startsWithWhen(template("", [identifier("name")]))).toBe(false);
			});
		});

		describe("when the first cooked value is null", () => {
			it("returns false", () => {
				expect.assertions(1);

				expect(startsWithWhen(template(null))).toBe(false);
			});
		});
	});

	describe("unreadable expression", () => {
		it("returns false for an identifier", () => {
			expect.assertions(1);

			expect(startsWithWhen(identifier("SomeClass"))).toBe(false);
		});
	});
});
