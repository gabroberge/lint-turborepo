import { describe, expect, it } from "vitest";

import { expectedOutput, lintRuleCase, projectMessages } from "../../rule-case";
import { noTestOutsideDescribeRule } from "./no-test-outside-describe";

const outsideDescribe = {
	messageId: "outsideDescribe" as const
};

describe("no-test-outside-describe", () => {
	const ruleCases = {
		invalid: [
			{
				code: 'it("returns the account", () => {});',
				errors: [outsideDescribe],
				name: "bare it"
			},
			{
				code: 'test("returns the account", () => {});',
				errors: [outsideDescribe],
				name: "bare test"
			},
			{
				code: 'it.skip("returns the account", () => {});',
				errors: [outsideDescribe],
				name: "it.skip at top level"
			},
			{
				code: 'it.only("returns the account", () => {});',
				errors: [outsideDescribe],
				name: "it.only at top level"
			},
			{
				code: 'it.each([[1]])("adds %s", () => {});',
				errors: [outsideDescribe],
				name: "it.each at top level"
			},
			{
				code: 'it.todo("returns the account");',
				errors: [outsideDescribe],
				name: "it.todo at top level"
			},
			{
				code: 'function helper() { it("x", () => {}); } describe("subject", () => { helper(); });',
				errors: [outsideDescribe],
				name: "helper defined outside describe"
			},
			{
				code: 'describe("getAccount", () => { it("returns the account", () => {}); });',
				errors: [outsideDescribe],
				name: "it directly inside the outermost describe"
			},
			{
				code: 'describe("getAccount", () => { test("returns the account", () => {}); });',
				errors: [outsideDescribe],
				name: "test directly inside the outermost describe"
			}
		],
		valid: [
			{
				code: 'describe("suite", () => { describe("getAccount", () => { it("returns the account", () => {}); }); });',
				name: "it inside describe"
			},
			{
				code: 'describe("getAccount", () => { describe("when the account exists", () => { it("returns the account", () => {}); }); });',
				name: "it inside nested describe"
			},
			{
				code: 'describe("suite", () => { describe("getAccount", () => { test("returns the account", () => {}); }); });',
				name: "test inside describe"
			},
			{
				code: 'describe("suite", () => { describe(DeleteAccountHandler, () => { it("calls the repository", () => {}); }); });',
				name: "describe with Identifier title"
			},
			{
				code: 'describe("suite", () => { describe.each([[1]])("input %s", () => { it("works", () => {}); }); });',
				name: "describe.each counts as context"
			},
			{
				code: 'describe("suite", () => { describe.skip("getAccount", () => { it("returns the account", () => {}); }); });',
				name: "describe.skip counts as context"
			},
			{
				code: 'describe("suite", () => { describe("math", () => { it.each([[1]])("adds %s", () => {}); }); });',
				name: "it.each inside describe"
			},
			{
				code: 'describe("suite", () => { describe("getAccount", () => { it.todo("returns the account"); }); });',
				name: "it.todo inside describe"
			},
			{
				code: 'describe("suite", () => { describe("subject", () => { function helper() { it("x", () => {}); } helper(); }); });',
				name: "helper defined inside describe"
			},
			{
				code: 'describe("suite", () => { describe("subject", () => { it.skipIf(false)("x", () => {}); }); });',
				name: "it.skipIf factory then title inside describe"
			},
			{
				code: 'describe("when the account exists", () => { describe("getAccount", () => { it("returns the account", () => {}); }); });',
				name: "a when-titled suite still counts once a describe is nested inside it"
			},
			{
				code: 'describe("suite", () => { describe("getAccount", () => { describe("when the account exists", () => { it("returns the account", () => {}); }); }); });',
				name: "three levels are allowed"
			},
			{
				code: 'describe("suite", () => { describe("context", () => { it("returns the account", () => {}); }); });',
				name: "any nested describe title satisfies the rule"
			}
		]
	};

	it.each(ruleCases.invalid)("$name", (testCase) => {
		expect.assertions(2);

		const result = lintRuleCase(noTestOutsideDescribeRule, "no-test-outside-describe", testCase);

		expect(projectMessages(noTestOutsideDescribeRule, result.messages, testCase.errors)).toStrictEqual(
			testCase.errors
		);
		expect(result.output).toBe(expectedOutput(testCase));
	});

	it.each(ruleCases.valid)("$name", (testCase) => {
		expect.assertions(2);

		const result = lintRuleCase(noTestOutsideDescribeRule, "no-test-outside-describe", testCase);

		expect(projectMessages(noTestOutsideDescribeRule, result.messages, [])).toStrictEqual([]);
		expect(result.output).toBe(expectedOutput(testCase));
	});
});
