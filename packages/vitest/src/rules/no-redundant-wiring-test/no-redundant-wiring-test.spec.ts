import { describe, expect, it } from "vitest";

import { expectedOutput, lintRuleCase, projectMessages } from "../../rule-case";
import { lines } from "../../testing/lines";
import { noRedundantWiringTestRule } from "./no-redundant-wiring-test";

const redundantWiringTest = {
	messageId: "redundantWiringTest" as const
};

describe("no-redundant-wiring-test meta", () => {
	describe("fixer", () => {
		it("fixes code", () => {
			expect.assertions(1);
			expect(noRedundantWiringTestRule.meta?.fixable).toBe("code");
		});
	});
});

describe("no-redundant-wiring-test", () => {
	const ruleCases = {
		invalid: [
			{
				code: lines(
					'describe("Worker", () => {',
					'	it("is defined", () => {',
					"		expect(worker).toBeDefined();",
					"	});",
					'	it("returns the result", () => {',
					"		expect(result).toBe(1);",
					"	});",
					"});"
				),
				errors: [redundantWiringTest],
				name: "a sibling behavioral test makes the wiring test redundant",
				output: lines(
					'describe("Worker", () => {',
					'	it("returns the result", () => {',
					"		expect(result).toBe(1);",
					"	});",
					"});"
				)
			},
			{
				code: lines(
					'describe("Worker", () => {',
					'	it("is defined", () => {',
					"		expect(worker).toBeDefined();",
					"	});",
					'	describe("run", () => {',
					'		it("returns the result", () => {',
					"			expect(result).toBe(1);",
					"		});",
					"	});",
					"});"
				),
				errors: [redundantWiringTest],
				name: "a behavioral test inside a nested describe makes the wiring test redundant",
				output: lines(
					'describe("Worker", () => {',
					'	describe("run", () => {',
					'		it("returns the result", () => {',
					"			expect(result).toBe(1);",
					"		});",
					"	});",
					"});"
				)
			},
			{
				code: lines(
					'describe("Worker", () => {',
					'	it("returns the result", () => {',
					"		expect(result).toBe(1);",
					"	});",
					'	it("is defined", () => {',
					"		expect(worker).toBeDefined();",
					"	});",
					"});"
				),
				errors: [redundantWiringTest],
				name: "a behavioral test before the wiring test makes it redundant",
				output: lines(
					'describe("Worker", () => {',
					'	it("returns the result", () => {',
					"		expect(result).toBe(1);",
					"	});",
					"});"
				)
			},
			{
				code: lines(
					'describe("Worker", () => {',
					'	describe("construction", () => {',
					'		it("is defined", () => {',
					"			expect(worker).toBeDefined();",
					"		});",
					"	});",
					'	describe("run", () => {',
					'		it("returns the result", () => {',
					"			expect(result).toBe(1);",
					"		});",
					"	});",
					"});"
				),
				errors: [redundantWiringTest],
				name: "a nested wiring test is redundant when the suite has another test",
				output: lines(
					'describe("Worker", () => {',
					'	describe("construction", () => {',
					"	});",
					'	describe("run", () => {',
					'		it("returns the result", () => {',
					"			expect(result).toBe(1);",
					"		});",
					"	});",
					"});"
				)
			},
			{
				code: lines(
					'describe("Worker", () => {',
					'	it("worker is defined", () => {',
					"		expect(worker).toBeDefined();",
					"	});",
					'	it("repository is defined", () => {',
					"		expect(repository).toBeDefined();",
					"	});",
					"});"
				),
				errors: [redundantWiringTest, redundantWiringTest],
				name: "two wiring tests make each other redundant",
				output: lines('describe("Worker", () => {', "", "});")
			},
			{
				code: lines(
					'describe("Worker", () => {',
					'	test("is defined", () => {',
					"		expect(worker).toBeDefined();",
					"	});",
					'	test("returns the result", () => {',
					"		expect(result).toBe(1);",
					"	});",
					"});"
				),
				errors: [redundantWiringTest],
				name: "test() is an executable test",
				output: lines(
					'describe("Worker", () => {',
					'	test("returns the result", () => {',
					"		expect(result).toBe(1);",
					"	});",
					"});"
				)
			},
			{
				code: lines(
					'describe("Worker", () => {',
					'	it("is defined", () => {',
					"		expect(worker).toBeDefined();",
					"	});",
					'	it.skip("returns the result", () => {',
					"		expect(result).toBe(1);",
					"	});",
					"});"
				),
				errors: [redundantWiringTest],
				name: "a skipped test with a callback counts",
				output: lines(
					'describe("Worker", () => {',
					'	it.skip("returns the result", () => {',
					"		expect(result).toBe(1);",
					"	});",
					"});"
				)
			},
			{
				code: lines(
					'describe("Worker", () => {',
					'	it.only("is defined", () => {',
					"		expect(worker).toBeDefined();",
					"	});",
					'	it("returns the result", () => {',
					"		expect(result).toBe(1);",
					"	});",
					"});"
				),
				errors: [redundantWiringTest],
				name: "a focused wiring test is redundant beside another test",
				output: lines(
					'describe("Worker", () => {',
					'	it("returns the result", () => {',
					"		expect(result).toBe(1);",
					"	});",
					"});"
				)
			},
			{
				code: lines(
					'describe("Worker", () => {',
					'	it("is defined", () => {',
					"		expect(worker).toBeDefined();",
					"	});",
					'	it.each([1, 2])("returns %s", (value) => {',
					"		expect(value).toBe(value);",
					"	});",
					"});"
				),
				errors: [redundantWiringTest],
				name: "a parameterized behavioral test counts",
				output: lines(
					'describe("Worker", () => {',
					'	it.each([1, 2])("returns %s", (value) => {',
					"		expect(value).toBe(value);",
					"	});",
					"});"
				)
			},
			{
				code: lines(
					'describe("Worker", () => {',
					'	it("is defined", () => {',
					"		expect(worker).toBeDefined();",
					"	});",
					'	it("returns the result", runCase);',
					"});"
				),
				errors: [redundantWiringTest],
				name: "an identifier callback still counts as another executable test",
				output: lines('describe("Worker", () => {', '\tit("returns the result", runCase);', "});")
			},
			{
				code: lines(
					'describe("Worker", () => {',
					'	it("is defined", () => {',
					"		expect(worker).toBeDefined();",
					"		expect(repository).toBeDefined();",
					"	});",
					'	it("returns the result", () => {',
					"		expect(result).toBe(1);",
					"	});",
					"});"
				),
				errors: [redundantWiringTest],
				name: "several toBeDefined assertions are removed with the test",
				output: lines(
					'describe("Worker", () => {',
					'	it("returns the result", () => {',
					"		expect(result).toBe(1);",
					"	});",
					"});"
				)
			},
			{
				code: lines(
					'describe("Worker", () => {',
					"	// Arrange the worker once.",
					"	beforeEach(() => {",
					"		worker = new Worker();",
					"	});",
					"",
					'	it("is defined", () => {',
					"		expect(worker).toBeDefined();",
					"	});",
					"",
					"	// Assert the public result.",
					'	it("returns the result", () => {',
					"		expect(result).toBe(1);",
					"	});",
					"});"
				),
				errors: [redundantWiringTest],
				name: "setup and neighboring comments stay in place",
				output: lines(
					'describe("Worker", () => {',
					"	// Arrange the worker once.",
					"	beforeEach(() => {",
					"		worker = new Worker();",
					"	});",
					"",
					"",
					"	// Assert the public result.",
					'	it("returns the result", () => {',
					"		expect(result).toBe(1);",
					"	});",
					"});"
				)
			},
			{
				code: lines(
					'describe("Worker", () => {',
					"	// Only checks construction.",
					'	it("is defined", () => {',
					"		expect(worker).toBeDefined();",
					"	});",
					'	it("returns the result", () => {',
					"		expect(result).toBe(1);",
					"	});",
					"});"
				),
				errors: [redundantWiringTest],
				name: "a comment attached to the wiring test is removed with it",
				output: lines(
					'describe("Worker", () => {',
					'	it("returns the result", () => {',
					"		expect(result).toBe(1);",
					"	});",
					"});"
				)
			},
			{
				code: lines(
					'describe("Worker", () => {',
					'	it("is defined", () => {',
					"		expect(worker).toBeDefined();",
					"	}); // belongs beside the next test",
					'	it("returns the result", () => {',
					"		expect(result).toBe(1);",
					"	});",
					"});"
				),
				errors: [redundantWiringTest],
				name: "a trailing comment on the wiring test is not removed",
				output: null
			},
			{
				code: lines(
					'describe("Worker", () => {',
					"	/*",
					"	 * construction only",
					"	 */",
					'	it("is defined", () => {',
					"		expect(worker).toBeDefined();",
					"	});",
					'	it("returns the result", () => {',
					"		expect(result).toBe(1);",
					"	});",
					"});"
				),
				errors: [redundantWiringTest],
				name: "a block comment directly above the wiring test is not removed",
				output: null
			},
			{
				code: lines(
					'describe("Worker", () => {',
					'	const defined = it("is defined", () => {',
					"		expect(worker).toBeDefined();",
					"	});",
					'	it("returns the result", () => {',
					"		expect(result).toBe(1);",
					"	});",
					"});"
				),
				errors: [redundantWiringTest],
				name: "a wiring test that is not the whole statement is not removed",
				output: null
			},
			{
				code: 'describe("Worker", () => { it("is defined", () => { expect(worker).toBeDefined(); }); it("returns the result", () => { expect(result).toBe(1); }); });',
				errors: [redundantWiringTest],
				name: "two tests on one line are not removed",
				output: null
			}
		],
		valid: [
			{
				code: lines(
					'describe("Worker", () => {',
					'	it("is defined", () => {',
					"		expect(worker).toBeDefined();",
					"	});",
					"});"
				),
				name: "the only test asserts toBeDefined"
			},
			{
				code: lines(
					'describe("Worker", () => {',
					'	it("is defined", () => {',
					"		expect(worker).toBeDefined();",
					"		expect(repository).toBeDefined();",
					"	});",
					"});"
				),
				name: "several toBeDefined assertions are still one wiring test"
			},
			{
				code: lines(
					'describe("Worker", () => {',
					'	it("is defined", () => {',
					"		expect((worker)).toBeDefined();",
					"		expect(worker!).toBeDefined();",
					"		expect(worker as Worker).toBeDefined();",
					"		expect(worker satisfies Worker).toBeDefined();",
					"	});",
					"});"
				),
				name: "transparent wrappers around the value stay a wiring test"
			},
			{
				code: 'describe("Worker", () => { it("is defined", () => expect(worker).toBeDefined()); });',
				name: "an expression-bodied arrow is a wiring test"
			},
			{
				code: lines(
					'describe("Worker", () => {',
					'	it("is defined", () => {',
					"		expect(worker).toBeDefined();",
					"	});",
					'	it.todo("returns the result");',
					"});"
				),
				name: "a todo declaration does not make the wiring test redundant"
			},
			{
				code: lines(
					'describe("Worker", () => {',
					'	it("is defined", () => {',
					"		expect(worker).toBeDefined();",
					"	});",
					'	it.todo("returns the result", () => {',
					"		expect(result).toBe(1);",
					"	});",
					"});"
				),
				name: "todo with a callback is still not an executable test"
			},
			{
				code: lines(
					'describe("Worker", () => {',
					'	it("is defined", () => {',
					"		expect(worker).toBeDefined();",
					"	});",
					'	it.skip("returns the result");',
					"});"
				),
				name: "a skipped test without a callback is not executable"
			},
			{
				code: lines(
					'describe("Worker", () => {',
					'	it("checks the value", () => {',
					"		expect(worker).toBeDefined();",
					"		expect(worker).toBe(worker);",
					"	});",
					'	it("returns the result", () => {',
					"		expect(result).toBe(1);",
					"	});",
					"});"
				),
				name: "another matcher is not a wiring test"
			},
			{
				code: lines(
					'describe("Worker", () => {',
					'	it("runs", () => {',
					"		worker.run();",
					"		expect(worker).toBeDefined();",
					"	});",
					'	it("returns the result", () => {',
					"		expect(result).toBe(1);",
					"	});",
					"});"
				),
				name: "an action beside toBeDefined is not a wiring test"
			},
			{
				code: lines(
					'describe("Worker", () => {',
					'	it("instantiates dependencies", () => {',
					"		expect(result).toBe(1);",
					"	});",
					'	it("returns the result", () => {',
					"		expect(result).toBe(1);",
					"	});",
					"});"
				),
				name: "a wiring-sounding title does not classify a behavioral body"
			},
			{
				code: lines(
					'describe("Worker", () => {',
					'	it("is defined", () => {',
					"		expect(result).toBe(1);",
					"	});",
					'	it("returns the result", () => {',
					"		expect(result).toBe(1);",
					"	});",
					"});"
				),
				name: "a defined title with a behavioral body is not a wiring test"
			},
			{
				code: lines(
					'describe("Worker", () => {',
					'	it("is defined", () => {',
					"		expect(worker).toBeDefined();",
					"	});",
					"});",
					'describe("Runner", () => {',
					'	it("returns the result", () => {',
					"		expect(result).toBe(1);",
					"	});",
					"});"
				),
				name: "a separate top-level describe is a different suite"
			},
			{
				code: 'describe("Worker", () => { it.each([1])("is defined", () => { expect(worker).toBeDefined(); }); });',
				name: "the only parameterized test can be a wiring test"
			},
			{
				code: 'describe("Worker", () => { it.skip("is defined", () => { expect(worker).toBeDefined(); }); });',
				name: "the only skipped test can be a wiring test"
			}
		]
	};

	it.each(ruleCases.invalid)("$name", (testCase) => {
		expect.assertions(2);

		const result = lintRuleCase(noRedundantWiringTestRule, "no-redundant-wiring-test", testCase);

		expect(projectMessages(noRedundantWiringTestRule, result.messages, testCase.errors)).toStrictEqual(
			testCase.errors
		);
		expect(result.output).toBe(expectedOutput(testCase));
	});

	it.each(ruleCases.valid)("$name", (testCase) => {
		expect.assertions(2);

		const result = lintRuleCase(noRedundantWiringTestRule, "no-redundant-wiring-test", testCase);

		expect(projectMessages(noRedundantWiringTestRule, result.messages, [])).toStrictEqual([]);
		expect(result.output).toBe(expectedOutput(testCase));
	});
});
