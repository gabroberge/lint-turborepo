import { describe, expect, it } from "vitest";

import { expectedOutput, lintRuleCase, projectMessages } from "../../rule-case";
import { lines } from "../../testing/lines";
import { requireExpectRule } from "./require-expect";

const missingExpect = {
	messageId: "missingExpect" as const
};

describe("require-expect", () => {
	const ruleCases = {
		invalid: [
			{
				code: lines(
					'it("creates the transaction", async () => {',
					"\tawait underTest.createTransaction();",
					"});"
				),
				errors: [missingExpect],
				name: "async it that only calls underTest"
			},
			{
				code: 'it.skip("creates the transaction", async () => { await underTest.createTransaction(); });',
				errors: [missingExpect],
				name: "it.skip with body and no expect"
			},
			{
				code: 'it.only("creates the transaction", () => { underTest.createTransaction(); });',
				errors: [missingExpect],
				name: "it.only with no expect"
			},
			{
				code: 'test("creates the transaction", () => { underTest.createTransaction(); });',
				errors: [missingExpect],
				name: "test with no expect"
			},
			{
				code: lines(
					"beforeEach(() => {",
					"\texpect(setup).toBeDefined();",
					"});",
					'it("creates the transaction", async () => {',
					"\tawait underTest.createTransaction();",
					"});"
				),
				errors: [missingExpect],
				name: "expect only in surrounding beforeEach"
			},
			{
				code: 'it("does nothing", () => {});',
				errors: [missingExpect],
				name: "empty it callback"
			},
			{
				code: 'it.each([[1]])("handles %s", (value) => { use(value); });',
				errors: [missingExpect],
				name: "it.each callback without expect"
			},
			{
				code: 'it("misnamed helper", () => { notExpect(1); });',
				errors: [missingExpect],
				name: "notExpect alone is not an assertion"
			},
			{
				code: lines(
					'it("returns the account", async () => {',
					"\tconst assertAccount = () => {",
					"\t\texpect(account).toEqual(expectedAccount);",
					"\t};",
					"\tawait underTest.getAccount();",
					"});"
				),
				errors: [missingExpect],
				name: "expect only inside a nested arrow function"
			},
			{
				code: lines(
					'it("returns the account", async () => {',
					"\tconst assertAccount = function () {",
					"\t\texpect(account).toEqual(expectedAccount);",
					"\t};",
					"\tawait underTest.getAccount();",
					"});"
				),
				errors: [missingExpect],
				name: "expect only inside a nested function expression"
			},
			{
				code: lines(
					'it("returns the account", async () => {',
					"\tfunction assertAccount() {",
					"\t\texpect(account).toEqual(expectedAccount);",
					"\t}",
					"\tawait underTest.getAccount();",
					"});"
				),
				errors: [missingExpect],
				name: "expect only inside a nested function declaration"
			},
			{
				code: lines(
					'it("returns the account", async () => {',
					"\tvalues.forEach((value) => {",
					"\t\texpect(value).toBeDefined();",
					"\t});",
					"});"
				),
				errors: [missingExpect],
				name: "expect only inside a forEach callback"
			},
			{
				code: lines(
					'it("returns the account", async () => {',
					"\t[1, 2, 3].map((value) => {",
					"\t\texpect(value).toBeDefined();",
					"\t});",
					"});"
				),
				errors: [missingExpect],
				name: "expect only inside a map callback"
			},
			{
				code: lines(
					'it("returns the account", async () => {',
					"\tconst account = await underTest.getAccount();",
					"\tassertAccount(account);",
					"});"
				),
				errors: [missingExpect],
				name: "external assertion helper is not inspected"
			},
			{
				code: lines(
					'it("returns the account", async () => {',
					"\tconst unusedAssertion = () => {",
					"\t\texpect(account).toEqual(expectedAccount);",
					"\t};",
					"\tawait underTest.getAccount();",
					"});"
				),
				errors: [missingExpect],
				name: "unused local assertion helper"
			},
			{
				code: lines(
					'it("returns the account", async () => {',
					"\tconst assertAccount = () => {",
					"\t\texpect(account).toEqual(expectedAccount);",
					"\t};",
					"\tconst account = await underTest.getAccount();",
					"\tassertAccount();",
					"});"
				),
				errors: [missingExpect],
				name: "invoked local assertion helper"
			},
			{
				code: lines(
					'it("returns the account", async () => {',
					'\tit("checks the account", () => {',
					"\t\texpect(account).toEqual(expectedAccount);",
					"\t});",
					"});"
				),
				errors: [missingExpect],
				name: "nested it assertion does not satisfy the parent"
			}
		],
		valid: [
			{
				code: lines(
					'it("creates the transaction", async () => {',
					"\tconst transaction = await underTest.createTransaction();",
					'\texpect(transaction.state).toBe("pending");',
					"});"
				),
				name: "expect result toBe"
			},
			{
				code: 'it("returns the entity", () => { expect(result).toEqual({ id: 1 }); });',
				name: "expect result toEqual"
			},
			{
				code: lines(
					'it("rejects", async () => {',
					"\tawait expect(action()).rejects.toThrow(AccountNotFoundError);",
					"});"
				),
				name: "await expect rejects toThrow"
			},
			{
				code: lines(
					'it("documents assertion count", () => {',
					"\texpect.assertions(1);",
					'\tthrow new Error("handled by assertions");',
					"});"
				),
				name: "expect.assertions as the only assertion"
			},
			{
				code: 'it("has assertions", () => { expect.hasAssertions(); });',
				name: "expect.hasAssertions"
			},
			{
				code: lines(
					'it("returns the expected result", async () => {',
					"\tconst result = await underTest.execute();",
					'\tif (result.type === "success") {',
					"\t\texpect(result.value).toEqual(expectedValue);",
					"\t}",
					"});"
				),
				name: "expect inside if in the test body"
			},
			{
				code: lines(
					'it("checks each value", () => {',
					"\tfor (const value of values) {",
					"\t\texpect(value).toBeDefined();",
					"\t}",
					"});"
				),
				name: "expect inside a for loop in the test body"
			},
			{
				code: lines(
					'it("checks several outcomes", () => {',
					"\texpect(a).toBe(1);",
					"\texpect(b).toBe(2);",
					"});"
				),
				name: "multiple expects"
			},
			{
				code: 'it.todo("creates the transaction");',
				name: "it.todo without expect"
			},
			{
				code: 'it.todo("creates the transaction", () => { underTest.createTransaction(); });',
				name: "it.todo with unused callback"
			},
			{
				code: 'test.todo("pending behavior");',
				name: "test.todo without expect"
			},
			{
				code: 'it.skip("creates the transaction");',
				name: "it.skip with no callback"
			},
			{
				code: 'it.each([[1]])("handles %s", (value) => { expect(value).toBe(1); });',
				name: "it.each with expect in callback"
			},
			{
				code: 'test("returns null", () => { expect(result).toBeNull(); });',
				name: "test with expect"
			},
			{
				code: "it.each([[1]]);",
				name: "factory call alone is ignored"
			},
			{
				code: 'it("uses expect", () => { notExpect(1); expect(1).toBe(1); });',
				name: "notExpect does not confuse matching"
			}
		]
	};

	it.each(ruleCases.invalid)("$name", (testCase) => {
		expect.assertions(2);

		const result = lintRuleCase(requireExpectRule, "require-expect", testCase);

		expect(projectMessages(requireExpectRule, result.messages, testCase.errors)).toStrictEqual(testCase.errors);
		expect(result.output).toBe(expectedOutput(testCase));
	});

	it.each(ruleCases.valid)("$name", (testCase) => {
		expect.assertions(2);

		const result = lintRuleCase(requireExpectRule, "require-expect", testCase);

		expect(projectMessages(requireExpectRule, result.messages, [])).toStrictEqual([]);
		expect(result.output).toBe(expectedOutput(testCase));
	});
});
