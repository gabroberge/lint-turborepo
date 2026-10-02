import { describe, expect, it } from "vitest";

import { requireArraySpeciesRule } from "./require-array-species";
import { lines } from "./testing/lines";
import { lint } from "./testing/lint";

const missingSpecies = {
	messageId: "missingSpecies",
	ruleId: "typescript/require-array-species"
};

describe("require-array-species meta", () => {
	it("warns by default", () => {
		expect.assertions(1);

		expect(requireArraySpeciesRule.defaultSeverity).toBe("warn");
	});

	it("is recommended", () => {
		expect.assertions(1);

		expect(requireArraySpeciesRule.meta?.docs?.recommended).toBe(true);
	});

	it("offers no autofix", () => {
		expect.assertions(1);

		expect(requireArraySpeciesRule.meta).not.toHaveProperty("fixable");
	});
});

describe("require-array-species", () => {
	it("reports a class that directly extends Array", () => {
		expect.assertions(2);

		const code = "class Users extends Array {}\n";
		const result = lint(code);

		expect(result.messages).toMatchObject([missingSpecies]);
		expect(result.output).toBe(code);
	});

	it("reports a generic Array<T> subclass", () => {
		expect.assertions(2);

		const code = "class Numbers extends Array<number> {}\n";
		const result = lint(code);

		expect(result.messages).toMatchObject([missingSpecies]);
		expect(result.output).toBe(code);
	});

	it("reports a class expression that extends Array", () => {
		expect.assertions(2);

		const code = "const Collection = class extends Array<string> {};\n";
		const result = lint(code);

		expect(result.messages).toMatchObject([missingSpecies]);
		expect(result.output).toBe(code);
	});

	it("accepts a static species getter that returns Array", () => {
		expect.assertions(2);

		const code = lines(
			"class Users extends Array<User> {",
			"	static get [Symbol.species](): ArrayConstructor {",
			"		return Array;",
			"	}",
			"}"
		);
		const result = lint(code);

		expect(result.messages).toStrictEqual([]);
		expect(result.output).toBe(code);
	});

	it("accepts a static species getter that returns this", () => {
		expect.assertions(2);

		const code = lines(
			"class Users extends Array<User> {",
			"	static get [Symbol.species]() {",
			"		return this;",
			"	}",
			"}"
		);
		const result = lint(code);

		expect(result.messages).toStrictEqual([]);
		expect(result.output).toBe(code);
	});

	it("accepts a static species field", () => {
		expect.assertions(2);

		const code = lines("class Users extends Array<User> {", "	static [Symbol.species] = Array;", "}");
		const result = lint(code);

		expect(result.messages).toStrictEqual([]);
		expect(result.output).toBe(code);
	});

	it("reports only the class that directly extends Array", () => {
		expect.assertions(2);

		const code = lines("class Users extends Array {}", "class Admins extends Users {}");
		const result = lint(code);

		expect(result.messages).toMatchObject([missingSpecies]);
		expect(result.output).toBe(code);
	});

	it("does not report an unrelated class", () => {
		expect.assertions(2);

		const code = "class Users {}\n";
		const result = lint(code);

		expect(result.messages).toStrictEqual([]);
		expect(result.output).toBe(code);
	});

	it("does not report a class that extends another named base", () => {
		expect.assertions(2);

		const code = "class Users extends Collection {}\n";
		const result = lint(code);

		expect(result.messages).toStrictEqual([]);
		expect(result.output).toBe(code);
	});

	it("still reports when only an instance species getter is present", () => {
		expect.assertions(2);

		const code = lines(
			"class Users extends Array<User> {",
			"	get [Symbol.species]() {",
			"		return Array;",
			"	}",
			"}"
		);
		const result = lint(code);

		expect(result.messages).toMatchObject([missingSpecies]);
		expect(result.output).toBe(code);
	});

	it("still reports a differently named computed member", () => {
		expect.assertions(2);

		const code = lines(
			"class Users extends Array<User> {",
			"	static get [Symbol.iterator]() {",
			"		return Array;",
			"	}",
			"}"
		);
		const result = lint(code);

		expect(result.messages).toMatchObject([missingSpecies]);
		expect(result.output).toBe(code);
	});
});
