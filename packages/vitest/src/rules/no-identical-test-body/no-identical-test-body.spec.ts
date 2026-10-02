import { describe, expect, it } from "vitest";

import { expectedOutput, lintRuleCase, projectMessages } from "../../rule-case";
import { lines } from "../../testing/lines";
import { noIdenticalTestBodyRule } from "./no-identical-test-body";

const identicalBody = {
	messageId: "identicalBody" as const
};

describe("no-identical-test-body", () => {
	const ruleCases = {
		invalid: [
			{
				code: lines(
					'it("does not persist rejected devices", async () => {',
					"\tawait underTest.registerMissingDevices();",
					"",
					"\texpect(repository.bulkCreate).not.toHaveBeenCalled();",
					"});",
					'it("ignores failed registrations", async () => {',
					"\tawait underTest.registerMissingDevices();",
					"",
					"\texpect(repository.bulkCreate).not.toHaveBeenCalled();",
					"});"
				),
				errors: [identicalBody],
				name: "different titles with identical bodies"
			},
			{
				code: lines(
					'it("returns the account", () => {',
					"\texpect(account).toEqual(expectedAccount);",
					"});",
					'test("loads the account", () => {',
					"\texpect(account).toEqual(expectedAccount);",
					"});"
				),
				errors: [identicalBody],
				name: "it and test with identical bodies"
			},
			{
				code: lines(
					'it("creates the transaction", async () => {',
					"\tawait underTest.createTransaction();",
					"});",
					'it("opens the transaction", async () => {',
					"\tawait underTest.createTransaction();",
					"});"
				),
				errors: [identicalBody],
				name: "identical async bodies"
			},
			{
				code: lines(
					'it("returns pending", () => {',
					'\texpect(transaction.state).toBe("pending");',
					"});",
					'it("exposes pending", () => {',
					'\texpect(transaction.state).toBe("pending");',
					"});"
				),
				errors: [identicalBody],
				name: "identical bodies using assertions"
			},
			{
				code: lines(
					'it("alpha", () => {',
					"\tuse(value);",
					"});",
					'it("beta", () => {',
					"\tuse(value);",
					"});"
				),
				errors: [identicalBody],
				name: "identical bodies where only the titles differ"
			},
			{
				code: lines(
					'it("one", () => {',
					"\texpect(1).toBe(1);",
					"});",
					'it("two", () => {',
					"\texpect(1).toBe(1);",
					"});",
					'it("three", () => {',
					"\texpect(1).toBe(1);",
					"});"
				),
				errors: [
					{ ...identicalBody, line: 4 },
					{ ...identicalBody, line: 7 }
				],
				name: "three identical tests report each duplicate after the first"
			},
			{
				code: lines(
					'describe("scenario", () => {',
					'\tit("does one thing", () => {',
					"\t\texpect(value).toBe(1);",
					"\t});",
					'\tit("does another thing", () => {',
					"\t\texpect(value).toBe(1);",
					"\t});",
					"});"
				),
				errors: [identicalBody],
				name: "identical bodies in the same immediate describe"
			},
			{
				code: lines(
					'it("runs the check", () => {',
					"\texpect(ok).toBe(true);",
					"});",
					'it.skip("skips the check", () => {',
					"\texpect(ok).toBe(true);",
					"});"
				),
				errors: [identicalBody],
				name: "identical bodies with different modifiers"
			}
		],
		valid: [
			{
				code: lines(
					'it("creates the account", async () => {',
					"\tawait underTest.createAccount();",
					"});",
					'it("returns the account", async () => {',
					"\tawait underTest.getAccount();",
					"});"
				),
				name: "two tests with different bodies"
			},
			{
				code: lines(
					'it("returns the pending state", () => {',
					'\texpect(transaction.state).toBe("pending");',
					"});",
					'it("returns the settled state", () => {',
					'\texpect(transaction.state).toBe("settled");',
					"});"
				),
				name: "same shape with different expected values"
			},
			{
				code: lines(
					'it("registers missing devices", async () => {',
					"\tawait underTest.registerMissingDevices();",
					"});",
					'it("registers found devices", async () => {',
					"\tawait underTest.registerFoundDevices();",
					"});"
				),
				name: "same shape with different function arguments"
			},
			{
				code: 'it.each([[1], [2]])("handles %s", (value) => { expect(value).toBeDefined(); });',
				name: "it.each has one authored callback"
			},
			{
				code: lines(
					'it.todo("pending behavior");',
					'it("returns the account", () => {',
					"\texpect(account).toBeDefined();",
					"});"
				),
				name: "callback-less it.todo"
			},
			{
				code: lines(
					'it("asserts in a block", () => {',
					"\texpect(value).toBe(1);",
					"});",
					'it("asserts as an expression", () => expect(value).toBe(1));'
				),
				name: "similar bodies that are not structurally identical"
			},
			{
				code: lines(
					'describe("first scenario", () => {',
					'\tit("does something", () => {',
					"\t\texpect(value).toBe(1);",
					"\t});",
					"});",
					'describe("second scenario", () => {',
					'\tit("does something else", () => {',
					"\t\texpect(value).toBe(1);",
					"\t});",
					"});"
				),
				name: "identical bodies in sibling describes"
			},
			{
				code: lines(
					'describe("scenario", () => {',
					'\tit("does something", () => {',
					"\t\texpect(value).toBe(1);",
					"\t});",
					"});",
					'describe("scenario", () => {',
					'\tit("does something else", () => {',
					"\t\texpect(value).toBe(1);",
					"\t});",
					"});"
				),
				name: "sibling describes with the same title are separate scopes"
			}
		]
	};

	it.each(ruleCases.invalid)("$name", (testCase) => {
		expect.assertions(2);

		const result = lintRuleCase(noIdenticalTestBodyRule, "no-identical-test-body", testCase);

		expect(projectMessages(noIdenticalTestBodyRule, result.messages, testCase.errors)).toStrictEqual(
			testCase.errors
		);
		expect(result.output).toBe(expectedOutput(testCase));
	});

	it.each(ruleCases.valid)("$name", (testCase) => {
		expect.assertions(2);

		const result = lintRuleCase(noIdenticalTestBodyRule, "no-identical-test-body", testCase);

		expect(projectMessages(noIdenticalTestBodyRule, result.messages, [])).toStrictEqual([]);
		expect(result.output).toBe(expectedOutput(testCase));
	});
});
