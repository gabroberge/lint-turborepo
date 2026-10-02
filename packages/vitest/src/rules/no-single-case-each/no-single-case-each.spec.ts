import { describe, expect, it } from "vitest";

import { expectedOutput, lintRuleCase, projectMessages } from "../../rule-case";
import { lines } from "../../testing/lines";
import { noSingleCaseEachRule } from "./no-single-case-each";

const singleCase = {
	messageId: "singleCase" as const
};

describe("no-single-case-each", () => {
	const ruleCases = {
		invalid: [
			{
				code: lines(
					'it.each(["pageSize"])("should be invalid when pageSize is %o", async (pageSize) => {',
					"\tuse(pageSize);",
					"});"
				),
				errors: [singleCase],
				name: "it.each with one string case"
			},
			{
				code: 'test.each([[42]])("works with %i", (value) => { use(value); });',
				errors: [singleCase],
				name: "test.each with one row"
			},
			{
				code: 'describe.each(["stripe"])("when provider is %s", (provider) => { it("works", () => { use(provider); }); });',
				errors: [singleCase],
				name: "describe.each with one case"
			},
			{
				code: 'it.each([[1, 2]])("handles %s", (left, right) => { use(left, right); });',
				errors: [singleCase],
				name: "one row with multiple columns"
			},
			{
				code: 'it.skip.each(["pageSize"])("should be invalid when %s", (field) => { use(field); });',
				errors: [singleCase],
				name: "it.skip.each with one case"
			},
			{
				code: 'it.concurrent.each([1])("handles %s", (value) => { use(value); });',
				errors: [singleCase],
				name: "it.concurrent.each with one case"
			},
			{
				code: 'describe("suite", () => { describe.each(["stripe"])("when provider is %s", (provider) => { it("works", () => { use(provider); }); }); });',
				errors: [singleCase],
				name: "single-case each nested in describe"
			},
			{
				code: 'it.each(([[1]] as const))("handles %s", (value) => { use(value); });',
				errors: [singleCase],
				name: "single-case table wrapped in as const"
			}
		],
		valid: [
			{
				code: 'it.each([[1], [2]])("handles %s", (value) => { expect(value).toBeDefined(); });',
				name: "it.each with multiple rows"
			},
			{
				code: 'test.each([1, 2])("works with %i", (value) => { expect(value).toBe(value); });',
				name: "test.each with multiple primitive cases"
			},
			{
				code: 'describe.each(["stripe", "square"])("when provider is %s", (provider) => { it("works", () => { use(provider); }); });',
				name: "describe.each with multiple cases"
			},
			{
				code: 'it.each([])("handles %s", () => {});',
				name: "it.each with an empty table"
			},
			{
				code: 'it.each(cases)("handles %s", (value) => { use(value); });',
				name: "it.each with an identifier table"
			},
			{
				code: 'it.each(getCases())("handles %s", (value) => { use(value); });',
				name: "it.each with a function-call table"
			},
			{
				code: 'it.each([...cases, "extra"])("handles %s", (value) => { use(value); });',
				name: "it.each with a spread"
			},
			{
				code: 'it.for([[1]])("handles %s", (value) => { use(value); });',
				name: "it.for is not each"
			},
			{
				code: 'describe("suite", () => { it.each([1, 2])("handles %s", (value) => { use(value); }); });',
				name: "multi-case each nested in describe"
			},
			{
				code: 'it.only.each(["pageSize", "page"])("should be invalid when %s", (field) => { use(field); });',
				name: "it.only.each with multiple cases"
			}
		]
	};

	it.each(ruleCases.invalid)("$name", (testCase) => {
		expect.assertions(2);

		const result = lintRuleCase(noSingleCaseEachRule, "no-single-case-each", testCase);

		expect(projectMessages(noSingleCaseEachRule, result.messages, testCase.errors)).toStrictEqual(testCase.errors);
		expect(result.output).toBe(expectedOutput(testCase));
	});

	it.each(ruleCases.valid)("$name", (testCase) => {
		expect.assertions(2);

		const result = lintRuleCase(noSingleCaseEachRule, "no-single-case-each", testCase);

		expect(projectMessages(noSingleCaseEachRule, result.messages, [])).toStrictEqual([]);
		expect(result.output).toBe(expectedOutput(testCase));
	});
});
