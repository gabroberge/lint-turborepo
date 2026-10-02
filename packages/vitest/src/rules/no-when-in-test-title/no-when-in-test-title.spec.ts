import { describe, expect, it } from "vitest";

import { expectedOutput, lintRuleCase, projectMessages } from "../../rule-case";
import { lines } from "../../testing/lines";
import { noWhenInTestTitleRule } from "./no-when-in-test-title";
import { promoted } from "./testing/promoted";
import { wrapped } from "./testing/wrapped";

const whenInTitle = {
	messageId: "whenInTitle" as const
};

describe("no-when-in-test-title", () => {
	const ruleCases = {
		invalid: [
			{
				code: 'it("returns null when the value is missing", () => {});',
				errors: [whenInTitle],
				name: "when in the middle of the title",
				output: wrapped("when the value is missing", 'it("returns null", () => {})')
			},
			{
				code: 'it("when the value is missing, returns null", () => {});',
				errors: [whenInTitle],
				name: "when at the start of the title",
				output: null
			},
			{
				code: 'it("returns null When the value is missing", () => {});',
				errors: [whenInTitle],
				name: "capitalized When",
				output: wrapped("When the value is missing", 'it("returns null", () => {})')
			},
			{
				code: 'it("returns null WHEN the value is missing", () => {});',
				errors: [whenInTitle],
				name: "uppercase WHEN",
				output: wrapped("WHEN the value is missing", 'it("returns null", () => {})')
			},
			{
				code: 'it("throws a typed error when nothing matches", () => {});',
				errors: [whenInTitle],
				name: "outcome before when",
				output: wrapped("when nothing matches", 'it("throws a typed error", () => {})')
			},
			{
				code: 'it("returns true when both values are empty", () => {});',
				errors: [whenInTitle],
				name: "condition after when",
				output: wrapped("when both values are empty", 'it("returns true", () => {})')
			},
			{
				code: "it(`returns null when ${reason}`, () => {});",
				errors: [whenInTitle],
				name: "template with static when",
				output: null
			},
			{
				code: "it(`returns null when missing`, () => {});",
				errors: [whenInTitle],
				name: "static template title",
				output: wrapped("when missing", 'it("returns null", () => {})')
			},
			{
				code: 'it.each([[1]])("adds when %s", () => {});',
				errors: [whenInTitle],
				name: "it.each title string",
				output: promoted('describe.each([[1]])("when %s"', "()", 'it("adds", () => {})')
			},
			{
				code: 'test.each([[1]])("returns $expected when $input", () => {});',
				errors: [whenInTitle],
				name: "test.each title string",
				output: null
			},
			{
				code: 'it.each([[1]])("formats %s when the value is missing", (value) => { expect(value).toBe(1); });',
				errors: [whenInTitle],
				name: "each placeholder stays on the outcome title",
				output: wrapped(
					"when the value is missing",
					'it.each([[1]])("formats %s", (value) => { expect(value).toBe(1); })'
				)
			},
			{
				code: 'it.skip("returns null when missing", () => {});',
				errors: [whenInTitle],
				name: "it.skip",
				output: wrapped("when missing", 'it.skip("returns null", () => {})')
			},
			{
				code: 'it.only("returns null when missing", () => {});',
				errors: [whenInTitle],
				name: "it.only",
				output: wrapped("when missing", 'it.only("returns null", () => {})')
			},
			{
				code: 'it.concurrent("returns null when missing", () => {});',
				errors: [whenInTitle],
				name: "it.concurrent",
				output: wrapped("when missing", 'it.concurrent("returns null", () => {})')
			},
			{
				code: 'it.todo("returns null when missing");',
				errors: [whenInTitle],
				name: "it.todo still encodes the condition",
				output: wrapped("when missing", 'it.todo("returns null")')
			},
			{
				code: 'test("returns null when missing", () => {});',
				errors: [whenInTitle],
				name: "test() alias",
				output: wrapped("when missing", 'test("returns null", () => {})')
			},
			{
				code: 'it.for([[1]])("handles when %s", () => {});',
				errors: [whenInTitle],
				name: "it.for title string",
				output: promoted('describe.for([[1]])("when %s"', "()", 'it("handles", () => {})')
			},
			{
				code: 'it.skipIf(false)("returns null when missing", () => {});',
				errors: [whenInTitle],
				name: "it.skipIf chained title",
				output: wrapped("when missing", 'it.skipIf(false)("returns null", () => {})')
			},
			{
				code: 'it.fails("returns null when missing", () => {});',
				errors: [whenInTitle],
				name: "it.fails title",
				output: wrapped("when missing", 'it.fails("returns null", () => {})')
			},
			{
				code: lines(
					'it("should return null when no value exists", async () => {',
					"\texpect(value).toBeNull();",
					"});"
				),
				errors: [whenInTitle],
				name: "should-return-null shape keeps the callback",
				output: lines(
					'describe("when no value exists", () => {',
					'\tit("should return null", async () => {',
					"\t\texpect(value).toBeNull();",
					"\t});",
					"});"
				)
			},
			{
				code: lines(
					"// keep outside",
					'it("returns null when missing", () => {',
					"\t// keep inside",
					"\texpect(value).toBeNull();",
					"});"
				),
				errors: [whenInTitle],
				name: "comments outside and inside the test stay in place",
				output: lines(
					"// keep outside",
					'describe("when missing", () => {',
					'\tit("returns null", () => {',
					"\t\t// keep inside",
					"\t\texpect(value).toBeNull();",
					"\t});",
					"});"
				)
			},
			{
				code: lines("describe(`when missing`, () => {", '\tit("returns null when missing", () => {});', "});"),
				errors: [whenInTitle],
				name: "static template describe title matches by value",
				output: lines("describe(`when missing`, () => {", '\tit("returns null", () => {});', "});")
			},
			{
				code: lines(
					'describe("when missing", () => {',
					'\tit("returns null when missing", () => {',
					"\t\texpect(value).toBeNull();",
					"\t});",
					"});"
				),
				errors: [whenInTitle],
				name: "matching describe is reused instead of wrapped",
				output: lines(
					'describe("when missing", () => {',
					'\tit("returns null", () => {',
					"\t\texpect(value).toBeNull();",
					"\t});",
					"});"
				)
			},
			{
				code: lines(
					'describe("suite", () => {',
					'\tdescribe("details", () => {',
					'\t\tit("returns null when missing", () => {',
					"\t\t\texpect(value).toBeNull();",
					"\t\t});",
					"\t});",
					"});"
				),
				errors: [whenInTitle],
				name: "nested describe that does not match gets a new wrapper",
				output: lines(
					'describe("suite", () => {',
					'\tdescribe("details", () => {',
					'\t\tdescribe("when missing", () => {',
					'\t\t\tit("returns null", () => {',
					"\t\t\t\texpect(value).toBeNull();",
					"\t\t\t});",
					"\t\t});",
					"\t});",
					"});"
				)
			},
			{
				code: lines('describe("when missing", () => {', '\tit("returns null When missing", () => {});', "});"),
				errors: [whenInTitle],
				name: "different capitalization does not reuse the describe",
				output: lines(
					'describe("when missing", () => {',
					'\tdescribe("When missing", () => {',
					'\t\tit("returns null", () => {});',
					"\t});",
					"});"
				)
			},
			{
				code: lines(
					'it("returns null when missing", () => {',
					"\texpect(value).toBeNull();",
					"});",
					'it("returns false when missing", () => {',
					"\texpect(value).toBe(false);",
					"});"
				),
				errors: [whenInTitle, whenInTitle],
				name: "sibling tests are wrapped separately",
				output: lines(
					'describe("when missing", () => {',
					'\tit("returns null", () => {',
					"\t\texpect(value).toBeNull();",
					"\t});",
					"});",
					'describe("when missing", () => {',
					'\tit("returns false", () => {',
					"\t\texpect(value).toBe(false);",
					"\t});",
					"});"
				)
			},
			{
				code: 'it("returns null, when missing", () => {});',
				errors: [whenInTitle],
				name: "punctuation before when is left on the outcome",
				output: wrapped("when missing", 'it("returns null,", () => {})')
			},
			{
				code: 'it("returns null when missing" as const, () => {});',
				errors: [whenInTitle],
				name: "as const title wrapper is preserved",
				output: wrapped("when missing", 'it("returns null" as const, () => {})')
			},
			{
				code: 'it("returns null when missing when empty", () => {});',
				errors: [whenInTitle],
				name: "two when words are reported and not split",
				output: null
			},
			{
				code: 'it("returns null when", () => {});',
				errors: [whenInTitle],
				name: "empty condition is reported and not split",
				output: null
			},
			{
				code: 'use(it("returns null when missing", () => {}));',
				errors: [whenInTitle],
				name: "call that is not the whole statement is not wrapped",
				output: null
			},
			{
				code: 'it("returns null when missing", () => {}); // stays',
				errors: [whenInTitle],
				name: "trailing line comment stays after the wrapper",
				output: `${wrapped("when missing", 'it("returns null", () => {})')} // stays`
			},
			{
				code: lines('describe("when  missing", () => {', '\tit("returns null when missing", () => {});', "});"),
				errors: [whenInTitle],
				name: "extra spaces in the describe title do not count as a match",
				output: lines(
					'describe("when  missing", () => {',
					'\tdescribe("when missing", () => {',
					'\t\tit("returns null", () => {});',
					"\t});",
					"});"
				)
			},
			{
				code: lines('it("returns null when missing", () => {', "\tconst text = `keep", "\tthis`;", "});"),
				errors: [whenInTitle],
				name: "multiline template in the body is not rewritten",
				output: null
			},
			{
				code: lines(
					'describe("when missing", () => {',
					'\tit("returns null when missing", () => {',
					"\t\tconst text = `keep",
					"\t\tthis`;",
					"\t});",
					"});"
				),
				errors: [whenInTitle],
				name: "matching describe still rewrites the title around a multiline template",
				output: lines(
					'describe("when missing", () => {',
					'\tit("returns null", () => {',
					"\t\tconst text = `keep",
					"\t\tthis`;",
					"\t});",
					"});"
				)
			},
			{
				code: 'it.runIf(true)("returns null when missing", () => {});',
				errors: [whenInTitle],
				name: "it.runIf keeps the condition call",
				output: wrapped("when missing", 'it.runIf(true)("returns null", () => {})')
			},
			{
				code: lines(
					'it.each(["a", "b"])(',
					'\t"should return the result when mode = %s",',
					"\t(mode) => {",
					"\t\tconst result = subject(mode);",
					"\t\texpect(result).toEqual(mode);",
					"\t}",
					");"
				),
				errors: [whenInTitle],
				name: "each placeholder only in the condition promotes the table",
				output: lines(
					'describe.each(["a", "b"])("when mode = %s", (mode) => {',
					'\tit("should return the result", () => {',
					"\t\tconst result = subject(mode);",
					"\t\texpect(result).toEqual(mode);",
					"\t});",
					"});"
				)
			},
			{
				code: 'it.each([{ value: 1 }])("formats $value when the flag is unset", ({ value }) => { expect(value).toBe(1); });',
				errors: [whenInTitle],
				name: "named placeholder only in the outcome stays on the test",
				output: wrapped(
					"when the flag is unset",
					'it.each([{ value: 1 }])("formats $value", ({ value }) => { expect(value).toBe(1); })'
				)
			},
			{
				code: 'it.each([[1, "a"]])("returns %i when mode = %s", (count, mode) => { expect(count).toBe(1); });',
				errors: [whenInTitle],
				name: "placeholders on both sides stay reported",
				output: null
			},
			{
				code: 'it.each(["a"])("returns 100%% when mode = %s", (mode) => { expect(mode).toBe("a"); });',
				errors: [whenInTitle],
				name: "escaped percent on the outcome is not moved off each",
				output: null
			},
			{
				code: 'it.each([[1, "a"]])("returns null when count = %i and mode = %s", (count, mode) => { expect(count + mode.length).toBe(2); });',
				errors: [whenInTitle],
				name: "multiple each parameters move together",
				output: promoted(
					'describe.each([[1, "a"]])("when count = %i and mode = %s"',
					"(count, mode)",
					'it("returns null", () => { expect(count + mode.length).toBe(2); })'
				)
			},
			{
				code: 'it.each([[0, "a"]])("returns null when %# %s $label $# $0", () => {});',
				errors: [whenInTitle],
				name: "condition keeps each placeholder forms",
				output: promoted(
					'describe.each([[0, "a"]])("when %# %s $label $# $0"',
					"()",
					'it("returns null", () => {})'
				)
			},
			{
				code: 'test.each(["a"])("returns null when mode = $mode", (mode) => { expect(mode).toBe("a"); });',
				errors: [whenInTitle],
				name: "test.each promotes and keeps the test callee",
				output: promoted(
					'describe.each(["a"])("when mode = $mode"',
					"(mode)",
					'test("returns null", () => { expect(mode).toBe("a"); })'
				)
			},
			{
				code: 'it.only.each(["a"])("returns null when mode = %s", (mode) => { expect(mode).toBe("a"); });',
				errors: [whenInTitle],
				name: "only.each promotes onto describe",
				output: promoted(
					'describe.only.each(["a"])("when mode = %s"',
					"(mode)",
					'it("returns null", () => { expect(mode).toBe("a"); })'
				)
			},
			{
				code: 'it.skipIf(false).each(["a"])("returns null when mode = %s", (mode) => { expect(mode).toBe("a"); });',
				errors: [whenInTitle],
				name: "skipIf.each promotes onto describe",
				output: promoted(
					'describe.skipIf(false).each(["a"])("when mode = %s"',
					"(mode)",
					'it("returns null", () => { expect(mode).toBe("a"); })'
				)
			},
			{
				code: 'it.concurrent.each(["a"])("returns null when mode = %s", (mode) => { expect(mode).toBe("a"); });',
				errors: [whenInTitle],
				name: "concurrent.each promotes onto describe",
				output: promoted(
					'describe.concurrent.each(["a"])("when mode = %s"',
					"(mode)",
					'it("returns null", () => { expect(mode).toBe("a"); })'
				)
			},
			{
				code: 'it.fails.each(["a"])("returns null when mode = %s", (mode) => { expect(mode).toBe("missing"); });',
				errors: [whenInTitle],
				name: "fails stays on the test when each moves",
				output: promoted(
					'describe.each(["a"])("when mode = %s"',
					"(mode)",
					'it.fails("returns null", () => { expect(mode).toBe("missing"); })'
				)
			},
			{
				code: 'it.for([[1, 2]])("returns null when values are %j", ([left, right], context) => { expect(merge(left, right, context)).toBeNull(); });',
				errors: [whenInTitle],
				name: "for keeps the row parameter and leaves context on the test",
				output: promoted(
					'describe.for([[1, 2]])("when values are %j"',
					"([left, right])",
					'it("returns null", (context) => { expect(merge(left, right, context)).toBeNull(); })'
				)
			},
			{
				code: 'it.each(["a"]).skip("returns null when mode = %s", (mode) => { expect(mode).toBe("a"); });',
				errors: [whenInTitle],
				name: "each followed by skip is not an equivalent describe chain",
				output: null
			},
			{
				code: 'it.todo.each(["a"])("returns null when mode = %s");',
				errors: [whenInTitle],
				name: "todo.each is not promoted",
				output: null
			},
			{
				code: 'it("returns null when mode = %s", () => {});',
				errors: [whenInTitle],
				name: "plain it with a condition placeholder is not promoted",
				output: null
			},
			{
				code: lines(
					'it.each(["a"])("returns null when mode = %s", async (mode) => {',
					"\tawait Promise.resolve(mode);",
					"});"
				),
				errors: [whenInTitle],
				name: "async each callback stays async on the test",
				output: lines(
					'describe.each(["a"])("when mode = %s", (mode) => {',
					'\tit("returns null", async () => {',
					"\t\tawait Promise.resolve(mode);",
					"\t});",
					"});"
				)
			},
			{
				code: lines(
					"// keep outside",
					'it.each(["a"])("returns null when mode = %s", (mode) => {',
					"\t// keep inside",
					'\texpect(mode).toBe("a");',
					"});"
				),
				errors: [whenInTitle],
				name: "each promotion keeps comments and the executable body",
				output: lines(
					"// keep outside",
					'describe.each(["a"])("when mode = %s", (mode) => {',
					'\tit("returns null", () => {',
					"\t\t// keep inside",
					'\t\texpect(mode).toBe("a");',
					"\t});",
					"});"
				)
			},
			{
				code: lines(
					"it.each`",
					"\tmode",
					'\t${"a"}',
					'`("returns null when mode = $mode", (mode) => {',
					'\texpect(mode).toBe("a");',
					"});"
				),
				errors: [whenInTitle],
				name: "tagged template each moves with the condition",
				output: lines(
					"describe.each`",
					"\tmode",
					'\t${"a"}',
					'`("when mode = $mode", (mode) => {',
					'\tit("returns null", () => {',
					'\t\texpect(mode).toBe("a");',
					"\t});",
					"});"
				)
			},
			{
				code: 'it.each(["a"])("returns null when mode = %s", () => {}, 5_000);',
				errors: [whenInTitle],
				name: "each timeout stays on the test",
				output: promoted('describe.each(["a"])("when mode = %s"', "()", 'it("returns null", () => {}, 5_000)')
			}
		],
		valid: [
			{
				code: 'it("returns null", () => {});',
				name: "outcome-only it title"
			},
			{
				code: 'describe("when the value is missing", () => { it("returns null", () => {}); });',
				name: "when belongs in describe"
			},
			{
				code: 'it("returns null whenever the cache is warm", () => {});',
				name: "whenever is not when"
			},
			{
				code: "it(`accepts ${name}`, () => {});",
				name: "template without static when"
			},
			{
				code: 'it("returns whence the value came", () => {});',
				name: "whence is not when"
			},
			{
				code: 'it("handles a whenfoo identifier", () => {});',
				name: "when only as substring of another word"
			},
			{
				code: 'describe.each([[1]])("when input is %s", () => { it("works", () => {}); });',
				name: "describe.each may use when"
			},
			{
				code: 'describe(SomeClass, () => { it("returns null", () => {}); });',
				name: "non-string describe title does not crash"
			},
			{
				code: "it(SomeClass, () => {});",
				name: "non-string it title is ignored"
			},
			{
				code: "it();",
				name: "it with no arguments does not crash"
			},
			{
				code: 'test("returns null", () => {});',
				name: "test without when"
			},
			{
				code: 'it.skipIf("when disabled")("returns null", () => {});',
				name: "skipIf condition is not a title"
			},
			{
				code: 'it.each(["when the account is missing"])("returns null", () => {});',
				name: "each table values are not titles"
			}
		]
	};

	it.each(ruleCases.invalid)("$name", (testCase) => {
		expect.assertions(2);

		const result = lintRuleCase(noWhenInTestTitleRule, "no-when-in-test-title", testCase);

		expect(projectMessages(noWhenInTestTitleRule, result.messages, testCase.errors)).toStrictEqual(testCase.errors);
		expect(result.output).toBe(expectedOutput(testCase));
	});

	it.each(ruleCases.valid)("$name", (testCase) => {
		expect.assertions(2);

		const result = lintRuleCase(noWhenInTestTitleRule, "no-when-in-test-title", testCase);

		expect(projectMessages(noWhenInTestTitleRule, result.messages, [])).toStrictEqual([]);
		expect(result.output).toBe(expectedOutput(testCase));
	});
});
