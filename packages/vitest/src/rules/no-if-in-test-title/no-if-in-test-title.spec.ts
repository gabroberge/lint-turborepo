import { describe, expect, it } from "vitest";

import { expectedOutput, lintRuleCase, projectMessages } from "../../rule-case";
import { noIfInTestTitleRule } from "./no-if-in-test-title";

const ifInTitle = {
	messageId: "ifInTitle" as const
};

describe("no-if-in-test-title meta", () => {
	describe("fixer", () => {
		it("offers no autofix", () => {
			expect.assertions(1);
			expect(noIfInTestTitleRule.meta).not.toHaveProperty("fixable");
		});
	});
});

describe("no-if-in-test-title", () => {
	const ruleCases = {
		invalid: [
			{
				code: 'it("should return false if the value is invalid", () => {});',
				errors: [ifInTitle],
				name: "if in a normal it"
			},
			{
				code: 'test("returns the fallback if no value exists", () => {});',
				errors: [ifInTitle],
				name: "if in test"
			},
			{
				code: 'it("should succeed IF the dependency responds", () => {});',
				errors: [ifInTitle],
				name: "capitalized IF"
			},
			{
				code: "it(`returns false if the value is invalid`, () => {});",
				errors: [ifInTitle],
				name: "static template title"
			},
			{
				code: "it(`returns false if ${reason}`, () => {});",
				errors: [ifInTitle],
				name: "template with a static if segment"
			},
			{
				code: 'it.each(cases)("returns %s if the input is missing", () => {});',
				errors: [ifInTitle],
				name: "it.each title"
			},
			{
				code: 'test.each(cases)("returns $value if the input is missing", () => {});',
				errors: [ifInTitle],
				name: "test.each title"
			},
			{
				code: 'it.skip("returns false if the value is invalid", () => {});',
				errors: [ifInTitle],
				name: "it.skip"
			},
			{
				code: 'it.only("returns false if the value is invalid", () => {});',
				errors: [ifInTitle],
				name: "it.only"
			},
			{
				code: 'it.todo("returns false if the value is invalid");',
				errors: [ifInTitle],
				name: "it.todo still encodes the condition"
			},
			{
				code: 'it.skipIf(false)("returns false if the value is invalid", () => {});',
				errors: [ifInTitle],
				name: "it.skipIf chained title"
			},
			{
				code: 'it.for(cases)("returns false if the value is invalid", () => {});',
				errors: [ifInTitle],
				name: "it.for title"
			},
			{
				code: 'it.fails("returns false if the value is invalid", () => {});',
				errors: [ifInTitle],
				name: "it.fails title"
			},
			{
				code: 'it("returns false if the value is invalid" as const, () => {});',
				errors: [ifInTitle],
				name: "as const title wrapper"
			}
		],
		valid: [
			{
				code: 'it("returns false", () => {});',
				name: "outcome-only it title"
			},
			{
				code: 'it("should diff values", () => {});',
				name: "diff is not if"
			},
			{
				code: 'it("should verify the result", () => {});',
				name: "verify is not if"
			},
			{
				code: 'it("returns true iff both flags match", () => {});',
				name: "iff is not the word if"
			},
			{
				code: 'describe("if the value is invalid", () => { it("returns false", () => {}); });',
				name: "if belongs in describe"
			},
			{
				code: "it(`accepts ${name}`, () => {});",
				name: "template without a static if"
			},
			{
				code: "it(SomeClass, () => {});",
				name: "non-string it title is ignored"
			},
			{
				code: "it(title, () => {});",
				name: "identifier title is ignored"
			},
			{
				code: "it();",
				name: "it with no arguments does not crash"
			},
			{
				code: 'test("returns the fallback", () => {});',
				name: "test without if"
			},
			{
				code: 'it.skipIf("if disabled")("returns false", () => {});',
				name: "skipIf condition is not a title"
			},
			{
				code: 'it.each(["if the input is missing"])("returns the fallback", () => {});',
				name: "each table values are not titles"
			},
			{
				code: 'describe.each([[1]])("if input is %s", () => { it("works", () => {}); });',
				name: "describe.each may use if"
			}
		]
	};

	it.each(ruleCases.invalid)("$name", (testCase) => {
		expect.assertions(2);

		const result = lintRuleCase(noIfInTestTitleRule, "no-if-in-test-title", testCase);

		expect(projectMessages(noIfInTestTitleRule, result.messages, testCase.errors)).toStrictEqual(testCase.errors);
		expect(result.output).toBe(expectedOutput(testCase));
	});

	it.each(ruleCases.valid)("$name", (testCase) => {
		expect.assertions(2);

		const result = lintRuleCase(noIfInTestTitleRule, "no-if-in-test-title", testCase);

		expect(projectMessages(noIfInTestTitleRule, result.messages, [])).toStrictEqual([]);
		expect(result.output).toBe(expectedOutput(testCase));
	});
});
