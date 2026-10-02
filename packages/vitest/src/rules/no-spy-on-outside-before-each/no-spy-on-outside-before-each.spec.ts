import { describe, expect, it } from "vitest";

import { expectedOutput, lintRuleCase, projectMessages } from "../../rule-case";
import { lines } from "../../testing/lines";
import { noSpyOnOutsideBeforeEachRule } from "./no-spy-on-outside-before-each";

const spyOnOutsideBeforeEach = { messageId: "spyOnOutsideBeforeEach" as const };

describe("no-spy-on-outside-before-each", () => {
	const ruleCases = {
		invalid: [
			{
				code: lines(
					'it("returns the result", async () => {',
					'	const methodSpy = vi.spyOn(service, "run");',
					"	await methodSpy;",
					"});"
				),
				errors: [spyOnOutsideBeforeEach],
				name: "vi.spyOn inside it"
			},
			{
				code: lines('test("returns the result", () => {', '	vi.spyOn(service, "run");', "});"),
				errors: [spyOnOutsideBeforeEach],
				name: "vi.spyOn inside test"
			},
			{
				code: lines(
					'describe("Worker", () => {',
					'	const methodSpy = vi.spyOn(service, "run");',
					"	void methodSpy;",
					"});"
				),
				errors: [spyOnOutsideBeforeEach],
				name: "vi.spyOn directly in describe"
			},
			{
				code: 'vi.spyOn(service, "run");\n',
				errors: [spyOnOutsideBeforeEach],
				name: "vi.spyOn at module scope"
			},
			{
				code: lines(
					'describe("Worker", () => {',
					"	beforeEach(() => {",
					"		const arrange = () => {",
					'			vi.spyOn(service, "run");',
					"		};",
					"		arrange();",
					"	});",
					"});"
				),
				errors: [spyOnOutsideBeforeEach],
				name: "a nested callback inside beforeEach does not own the spy"
			},
			{
				code: lines(
					"function arrange(): void {",
					'	vi.spyOn(service, "run");',
					"}",
					"",
					"beforeEach(arrange);"
				),
				errors: [spyOnOutsideBeforeEach],
				name: "a spy in a named setup function is not inside beforeEach"
			},
			{
				code: lines(
					'describe("Worker", () => {',
					"	beforeAll(() => {",
					'		vi.spyOn(service, "run");',
					"	});",
					"});"
				),
				errors: [spyOnOutsideBeforeEach],
				name: "beforeAll is not beforeEach"
			}
		],
		valid: [
			{
				code: lines(
					'describe("Worker", () => {',
					"	beforeEach(() => {",
					'		vi.spyOn(service, "run");',
					"	});",
					"});"
				),
				name: "vi.spyOn directly in beforeEach"
			},
			{
				code: lines(
					'describe("Worker", () => {',
					"	let methodSpy: ReturnType<typeof vi.spyOn>;",
					"",
					"	beforeEach(() => {",
					'		methodSpy = vi.spyOn(service, "run");',
					"	});",
					"});"
				),
				name: "vi.spyOn assigned to an outer variable in beforeEach"
			},
			{
				code: lines(
					'describe("Worker", () => {',
					"	beforeEach(() => {",
					'		vi.spyOn(service, "run").mockResolvedValue(1);',
					"	});",
					"});"
				),
				name: "chained spy configuration in beforeEach"
			},
			{
				code: lines(
					'describe("Worker", () => {',
					"	beforeEach(() => {",
					'		vi.spyOn(service, "run");',
					'		vi.spyOn(repository, "save");',
					"	});",
					"});"
				),
				name: "several spies in one beforeEach"
			},
			{
				code: lines('it("returns the result", () => {', '	jest.spyOn(service, "run");', "});"),
				name: "jest.spyOn is not this rule"
			},
			{
				code: lines('it("returns the result", () => {', '	vi?.spyOn(service, "run");', "});"),
				name: "an optional vi.spyOn is not recognized"
			}
		]
	};

	it.each(ruleCases.invalid)("$name", (testCase) => {
		expect.assertions(2);

		const result = lintRuleCase(noSpyOnOutsideBeforeEachRule, "no-spy-on-outside-before-each", testCase);

		expect(projectMessages(noSpyOnOutsideBeforeEachRule, result.messages, testCase.errors)).toStrictEqual(
			testCase.errors
		);
		expect(result.output).toBe(expectedOutput(testCase));
	});

	it.each(ruleCases.valid)("$name", (testCase) => {
		expect.assertions(2);

		const result = lintRuleCase(noSpyOnOutsideBeforeEachRule, "no-spy-on-outside-before-each", testCase);

		expect(projectMessages(noSpyOnOutsideBeforeEachRule, result.messages, [])).toStrictEqual([]);
		expect(result.output).toBe(expectedOutput(testCase));
	});
});
