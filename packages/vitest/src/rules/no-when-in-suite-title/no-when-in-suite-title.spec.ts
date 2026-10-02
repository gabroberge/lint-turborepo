import { describe, expect, it } from "vitest";

import { expectedOutput, lintRuleCase, projectMessages } from "../../rule-case";
import { noWhenInSuiteTitleRule } from "./no-when-in-suite-title";

const whenInSuiteTitle = {
	messageId: "whenInSuiteTitle" as const
};

describe("no-when-in-suite-title meta", () => {
	describe("fixer", () => {
		it("offers no autofix", () => {
			expect.assertions(1);
			expect(noWhenInSuiteTitleRule.meta).not.toHaveProperty("fixable");
		});
	});
});

describe("no-when-in-suite-title", () => {
	const ruleCases = {
		invalid: [
			{
				code: 'describe("when the account is missing", () => { it("returns null", () => {}); });',
				errors: [whenInSuiteTitle],
				name: "suite title starts with when"
			},
			{
				code: 'describe("When the account is missing", () => { it("returns null", () => {}); });',
				errors: [whenInSuiteTitle],
				name: "capitalized When"
			},
			{
				code: 'describe(" when the account is missing", () => { it("returns null", () => {}); });',
				errors: [whenInSuiteTitle],
				name: "leading whitespace"
			},
			{
				code: 'describe(`when the account is missing`, () => { it("returns null", () => {}); });',
				errors: [whenInSuiteTitle],
				name: "static template title"
			},
			{
				code: 'describe(`when ${reason}`, () => { it("returns null", () => {}); });',
				errors: [whenInSuiteTitle],
				name: "template that starts with when before an interpolation"
			},
			{
				code: 'describe.skip("when the account is missing", () => { it("returns null", () => {}); });',
				errors: [whenInSuiteTitle],
				name: "describe.skip suite"
			},
			{
				code: 'describe.each([[1]])("when input is %s", () => { it("works", () => {}); });',
				errors: [whenInSuiteTitle],
				name: "describe.each suite title"
			},
			{
				code: 'describe("when the account is missing", () => { describe("getAccount", () => { it("returns null", () => {}); }); });',
				errors: [whenInSuiteTitle],
				name: "when suite that already contains a subject describe"
			},
			{
				code: 'describe("when the account is missing", () => { describe("when the id is empty", () => { it("returns null", () => {}); }); });',
				errors: [whenInSuiteTitle],
				name: "a nested when scenario is not a second suite violation"
			},
			{
				code: 'describe("when the account is missing", () => { it("returns null", () => {}); }); describe("Accounts", () => { it("returns the account", () => {}); });',
				errors: [whenInSuiteTitle],
				name: "only the when suite among top-level describes"
			},
			{
				code: 'describe("when", () => { it("returns null", () => {}); });',
				errors: [whenInSuiteTitle],
				name: "the word when alone"
			},
			{
				code: 'describe(("when the account is missing"), () => { it("returns null", () => {}); });',
				errors: [whenInSuiteTitle],
				name: "parenthesized title"
			},
			{
				code: 'function helper() { describe("when the account is missing", () => { it("returns null", () => {}); }); }',
				errors: [whenInSuiteTitle],
				name: "describe written in a helper is still a suite"
			}
		],
		valid: [
			{
				code: 'describe("Accounts", () => { it("returns the account", () => {}); });',
				name: "suite name without when"
			},
			{
				code: 'describe("Accounts", () => { describe("when the account is missing", () => { it("returns null", () => {}); }); });',
				name: "when belongs on a nested scenario describe"
			},
			{
				code: 'describe("whenever the cache is warm", () => { it("returns the cached value", () => {}); });',
				name: "whenever is not when"
			},
			{
				code: 'describe("whenfoo parser", () => { it("parses the input", () => {}); });',
				name: "whenfoo is not the word when"
			},
			{
				code: 'describe("Accounts when empty", () => { it("returns null", () => {}); });',
				name: "when that is not the first word"
			},
			{
				code: 'describe(SomeClass, () => { it("returns the account", () => {}); });',
				name: "identifier suite title is ignored"
			},
			{
				code: 'describe.each([[1]])("input %s", () => { it("works", () => {}); });',
				name: "describe.each title that does not start with when"
			},
			{
				code: 'it("returns null when the account is missing", () => {});',
				name: "when in an it title is not this rule"
			},
			{
				code: 'describe(`Accounts`, () => { it("returns the account", () => {}); });',
				name: "template suite title without when"
			},
			{
				code: 'describe(`${name} when ready`, () => { it("returns the account", () => {}); });',
				name: "interpolation before when is not a leading when"
			},
			{
				code: 'describe.skip("Accounts", () => { describe("when the account is missing", () => { it("returns null", () => {}); }); });',
				name: "describe.skip may nest a when scenario"
			},
			{
				code: "describe();",
				name: "describe with no arguments does not crash"
			},
			{
				code: "describe(...titles, () => {});",
				name: "spread title is ignored"
			}
		]
	};

	it.each(ruleCases.invalid)("$name", (testCase) => {
		expect.assertions(2);

		const result = lintRuleCase(noWhenInSuiteTitleRule, "no-when-in-suite-title", testCase);

		expect(projectMessages(noWhenInSuiteTitleRule, result.messages, testCase.errors)).toStrictEqual(
			testCase.errors
		);
		expect(result.output).toBe(expectedOutput(testCase));
	});

	it.each(ruleCases.valid)("$name", (testCase) => {
		expect.assertions(2);

		const result = lintRuleCase(noWhenInSuiteTitleRule, "no-when-in-suite-title", testCase);

		expect(projectMessages(noWhenInSuiteTitleRule, result.messages, [])).toStrictEqual([]);
		expect(result.output).toBe(expectedOutput(testCase));
	});
});
