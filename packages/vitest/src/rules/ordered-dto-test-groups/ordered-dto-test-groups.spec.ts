import { describe, expect, it } from "vitest";

import { expectedOutput, lintRuleCase, projectMessages } from "../../rule-case";
import { lines } from "../../testing/lines";
import { orderedDtoTestGroupsRule } from "./ordered-dto-test-groups";

const filename = "example.dto.spec.ts";

const unordered = { messageId: "unordered" as const };
const unclassified = { messageId: "unclassified" as const };

describe("ordered-dto-test-groups meta", () => {
	describe("fixer", () => {
		it("fixes code", () => {
			expect.assertions(1);
			expect(orderedDtoTestGroupsRule.meta?.fixable).toBe("code");
		});
	});
});

describe("ordered-dto-test-groups", () => {
	const ruleCases = {
		invalid: [
			{
				code: lines(
					'describe("ExampleDto", () => {',
					'	describe("page", () => {',
					'		it("rejects 0", () => {',
					"			expect(page).toBe(0);",
					"		});",
					"	});",
					"",
					'	describe("name", () => {',
					'		it("rejects an empty name", () => {',
					'			expect(name).toBe("");',
					"		});",
					"	});",
					"});"
				),
				errors: [unordered],
				filename,
				name: "property describes are sorted alphabetically",
				output: lines(
					'describe("ExampleDto", () => {',
					'	describe("name", () => {',
					'		it("rejects an empty name", () => {',
					'			expect(name).toBe("");',
					"		});",
					"	});",
					"",
					'	describe("page", () => {',
					'		it("rejects 0", () => {',
					"			expect(page).toBe(0);",
					"		});",
					"	});",
					"});"
				)
			},
			{
				code: lines(
					'describe("ExampleDto", () => {',
					'	describe("name", () => {',
					'		it("rejects an empty name", () => {',
					'			expect(name).toBe("");',
					"		});",
					"	});",
					"",
					'	describe("when the value is missing", () => {',
					'		it("rejects a missing value", () => {',
					"			expect(value).toBeUndefined();",
					"		});",
					"	});",
					"});"
				),
				errors: [unordered],
				filename,
				name: "a when describe comes before property describes",
				output: lines(
					'describe("ExampleDto", () => {',
					'	describe("when the value is missing", () => {',
					'		it("rejects a missing value", () => {',
					"			expect(value).toBeUndefined();",
					"		});",
					"	});",
					"",
					'	describe("name", () => {',
					'		it("rejects an empty name", () => {',
					'			expect(name).toBe("");',
					"		});",
					"	});",
					"});"
				)
			},
			{
				code: lines(
					'describe("ExampleDto", () => {',
					'	describe("when the value is zero", () => {',
					'		it("rejects zero", () => {',
					"			expect(value).toBe(0);",
					"		});",
					"	});",
					"",
					'	describe("name", () => {',
					'		it("rejects an empty name", () => {',
					'			expect(name).toBe("");',
					"		});",
					"	});",
					"",
					'	describe("when the value is missing", () => {',
					'		it("rejects a missing value", () => {',
					"			expect(value).toBeUndefined();",
					"		});",
					"	});",
					"});"
				),
				errors: [unordered],
				filename,
				name: "when describes keep their relative order",
				output: lines(
					'describe("ExampleDto", () => {',
					'	describe("when the value is zero", () => {',
					'		it("rejects zero", () => {',
					"			expect(value).toBe(0);",
					"		});",
					"	});",
					"",
					'	describe("when the value is missing", () => {',
					'		it("rejects a missing value", () => {',
					"			expect(value).toBeUndefined();",
					"		});",
					"	});",
					"",
					'	describe("name", () => {',
					'		it("rejects an empty name", () => {',
					'			expect(name).toBe("");',
					"		});",
					"	});",
					"});"
				)
			},
			{
				code: lines(
					'describe("ExampleDto", () => {',
					'	describe("page", () => {',
					'		it("rejects 0", () => {',
					"			expect(page).toBe(0);",
					"		});",
					"	});",
					"",
					"	function createDto(): ExampleDto {",
					"		return new ExampleDto();",
					"	}",
					"",
					"	beforeEach(() => {",
					"		dto = createDto();",
					"	});",
					"",
					'	describe("name", () => {',
					'		it("rejects an empty name", () => {',
					'			expect(name).toBe("");',
					"		});",
					"	});",
					"});"
				),
				errors: [unordered],
				filename,
				name: "setup stays first and keeps its source order",
				output: lines(
					'describe("ExampleDto", () => {',
					"	function createDto(): ExampleDto {",
					"		return new ExampleDto();",
					"	}",
					"",
					"	beforeEach(() => {",
					"		dto = createDto();",
					"	});",
					"",
					'	describe("name", () => {',
					'		it("rejects an empty name", () => {',
					'			expect(name).toBe("");',
					"		});",
					"	});",
					"",
					'	describe("page", () => {',
					'		it("rejects 0", () => {',
					"			expect(page).toBe(0);",
					"		});",
					"	});",
					"});"
				)
			},
			{
				code: lines(
					'describe("ExampleDto", () => {',
					"	// page coverage",
					'	describe("page", () => {',
					'		it("rejects 0", () => {',
					"			expect(page).toBe(0);",
					"		});",
					"	});",
					"",
					"	// name coverage",
					'	describe("name", () => {',
					'		it("rejects an empty name", () => {',
					'			expect(name).toBe("");',
					"		});",
					"	});",
					"});"
				),
				errors: [unordered],
				filename,
				name: "a comment above a property describe moves with it",
				output: lines(
					'describe("ExampleDto", () => {',
					"	// name coverage",
					'	describe("name", () => {',
					'		it("rejects an empty name", () => {',
					'			expect(name).toBe("");',
					"		});",
					"	});",
					"",
					"	// page coverage",
					'	describe("page", () => {',
					'		it("rejects 0", () => {',
					"			expect(page).toBe(0);",
					"		});",
					"	});",
					"});"
				)
			},
			{
				code: lines(
					'describe("ExampleDto", () => {',
					'	describe.each(["a", "b"])("page", (value) => {',
					'		it("rejects %s", () => {',
					"			expect(value).toBeDefined();",
					"		});",
					"	});",
					"",
					'	describe("name", () => {',
					'		it("rejects an empty name", () => {',
					'			expect(name).toBe("");',
					"		});",
					"	});",
					"});"
				),
				errors: [unordered],
				filename,
				name: "a describe.each property title sorts with the other property describes",
				output: lines(
					'describe("ExampleDto", () => {',
					'	describe("name", () => {',
					'		it("rejects an empty name", () => {',
					'			expect(name).toBe("");',
					"		});",
					"	});",
					"",
					'	describe.each(["a", "b"])("page", (value) => {',
					'		it("rejects %s", () => {',
					"			expect(value).toBeDefined();",
					"		});",
					"	});",
					"});"
				)
			},
			{
				code: lines(
					'describe("ExampleDto", () => {',
					'	describe("name", () => {',
					'		it("rejects an empty name", () => {',
					'			expect(name).toBe("");',
					"		});",
					"	});",
					"",
					'	describe.each([0, 1])("when the value is %s", (value) => {',
					'		it("rejects %s", () => {',
					"			expect(value).toBeDefined();",
					"		});",
					"	});",
					"",
					'	describe.each(["a", "b"])("when the label is %s", (label) => {',
					'		it("rejects %s", () => {',
					"			expect(label).toBeDefined();",
					"		});",
					"	});",
					"});"
				),
				errors: [unordered],
				filename,
				name: "describe.each when titles move before property describes and keep their relative order",
				output: lines(
					'describe("ExampleDto", () => {',
					'	describe.each([0, 1])("when the value is %s", (value) => {',
					'		it("rejects %s", () => {',
					"			expect(value).toBeDefined();",
					"		});",
					"	});",
					"",
					'	describe.each(["a", "b"])("when the label is %s", (label) => {',
					'		it("rejects %s", () => {',
					"			expect(label).toBeDefined();",
					"		});",
					"	});",
					"",
					'	describe("name", () => {',
					'		it("rejects an empty name", () => {',
					'			expect(name).toBe("");',
					"		});",
					"	});",
					"});"
				)
			},
			{
				code: lines(
					'describe("ExampleDto", () => {',
					'	describe("page", () => {',
					'		describe("nested", () => {',
					'			it("rejects 0", () => {',
					"				expect(page).toBe(0);",
					"			});",
					"		});",
					"",
					'		describe("when the page is missing", () => {',
					'			it("rejects a missing page", () => {',
					"				expect(page).toBeUndefined();",
					"			});",
					"		});",
					"	});",
					"",
					'	describe("name", () => {',
					'		describe("when the name is empty", () => {',
					'			it("rejects an empty name", () => {',
					'				expect(name).toBe("");',
					"			});",
					"		});",
					"",
					'		describe("inner", () => {',
					'			it("rejects an inner value", () => {',
					"				expect(inner).toBeDefined();",
					"			});",
					"		});",
					"	});",
					"});"
				),
				errors: [unordered],
				filename,
				name: "only direct suite children are reordered when property groups contain nested describes",
				output: lines(
					'describe("ExampleDto", () => {',
					'	describe("name", () => {',
					'		describe("when the name is empty", () => {',
					'			it("rejects an empty name", () => {',
					'				expect(name).toBe("");',
					"			});",
					"		});",
					"",
					'		describe("inner", () => {',
					'			it("rejects an inner value", () => {',
					"				expect(inner).toBeDefined();",
					"			});",
					"		});",
					"	});",
					"",
					'	describe("page", () => {',
					'		describe("nested", () => {',
					'			it("rejects 0", () => {',
					"				expect(page).toBe(0);",
					"			});",
					"		});",
					"",
					'		describe("when the page is missing", () => {',
					'			it("rejects a missing page", () => {',
					"				expect(page).toBeUndefined();",
					"			});",
					"		});",
					"	});",
					"});"
				)
			},
			{
				code: lines(
					'describe("ExampleDto", () => {',
					'	describe("when", () => {',
					'		it("rejects a missing value", () => {',
					"			expect(value).toBeUndefined();",
					"		});",
					"	});",
					"",
					'	describe("name", () => {',
					'		it("rejects an empty name", () => {',
					'			expect(name).toBe("");',
					"		});",
					"	});",
					"});"
				),
				errors: [unordered],
				filename,
				name: "a describe titled when is a property name",
				output: lines(
					'describe("ExampleDto", () => {',
					'	describe("name", () => {',
					'		it("rejects an empty name", () => {',
					'			expect(name).toBe("");',
					"		});",
					"	});",
					"",
					'	describe("when", () => {',
					'		it("rejects a missing value", () => {',
					"			expect(value).toBeUndefined();",
					"		});",
					"	});",
					"});"
				)
			},
			{
				code: lines(
					'describe("ExampleDto", () => {',
					'	describe("page", () => {',
					'		it("rejects 0", () => {',
					"			expect(page).toBe(0);",
					"		});",
					"	});",
					"",
					'	it("rejects a missing value", () => {',
					"		expect(value).toBeUndefined();",
					"	});",
					"",
					'	describe("name", () => {',
					'		it("rejects an empty name", () => {',
					'			expect(name).toBe("");',
					"		});",
					"	});",
					"});"
				),
				errors: [unordered, unclassified],
				filename,
				name: "an unclassified child blocks the fix when properties are also out of order",
				output: null
			},
			{
				code: lines(
					'describe("ExampleDto", () => {',
					'	describe("name", () => {',
					'		it("rejects an empty name", () => {',
					'			expect(name).toBe("");',
					"		});",
					"	});",
					"",
					'	it("rejects a missing value", () => {',
					"		expect(value).toBeUndefined();",
					"	});",
					"",
					'	describe("page", () => {',
					'		it("rejects 0", () => {',
					"			expect(page).toBe(0);",
					"		});",
					"	});",
					"});"
				),
				errors: [unclassified],
				filename,
				name: "a top-level test is not reordered",
				output: null
			},
			{
				code: lines(
					'describe("ExampleDto", () => {',
					'	describe("name", () => {',
					'		it("rejects an empty name", () => {',
					'			expect(name).toBe("");',
					"		});",
					"	});",
					"",
					'	describe("full name", () => {',
					'		it("rejects a blank full name", () => {',
					'			expect(fullName).toBe("");',
					"		});",
					"	});",
					"});"
				),
				errors: [unclassified],
				filename,
				name: "a describe title that is neither a property nor when is not reordered",
				output: null
			},
			{
				code: 'describe("ExampleDto", () => { describe("page", () => { it("rejects 0", () => { expect(page).toBe(0); }); }); describe("name", () => { it("rejects an empty name", () => { expect(name).toBe(""); }); }); });\n',
				errors: [unordered],
				filename,
				name: "two property describes on one line are not reordered",
				output: null
			}
		],
		valid: [
			{
				code: lines(
					'describe("ExampleDto", () => {',
					"	let dto: ExampleDto;",
					"",
					"	beforeEach(() => {",
					"		dto = new ExampleDto();",
					"	});",
					"",
					'	describe("when the value is zero", () => {',
					'		it("rejects zero", () => {',
					"			expect(dto).toBeDefined();",
					"		});",
					"	});",
					"",
					'	describe("when the value is missing", () => {',
					'		it("rejects a missing value", () => {',
					"			expect(dto).toBeDefined();",
					"		});",
					"	});",
					"",
					'	describe("name", () => {',
					'		it("rejects an empty name", () => {',
					'			expect(name).toBe("");',
					"		});",
					"	});",
					"",
					'	describe("page", () => {',
					'		it("rejects 0", () => {',
					"			expect(page).toBe(0);",
					"		});",
					"	});",
					"});"
				),
				filename,
				name: "setup, when describes, then property describes"
			},
			{
				code: lines(
					'describe("ExampleDto", () => {',
					'	describe("name", () => {',
					'		describe("page", () => {',
					'			it("rejects 0", () => {',
					"				expect(page).toBe(0);",
					"			});",
					"		});",
					"",
					'		describe("when the value is missing", () => {',
					'			it("rejects a missing value", () => {',
					"				expect(value).toBeUndefined();",
					"			});",
					"		});",
					"	});",
					"});"
				),
				filename,
				name: "nested describes are not reordered"
			},
			{
				code: lines(
					'describe("ExampleDto", () => {',
					'	describe.each([0, 1])("when the value is %s", (value) => {',
					'		it("rejects %s", () => {',
					"			expect(value).toBeDefined();",
					"		});",
					"	});",
					"",
					'	describe.each(["a", "b"])("when the label is %s", (label) => {',
					'		it("rejects %s", () => {',
					"			expect(label).toBeDefined();",
					"		});",
					"	});",
					"",
					'	describe("name", () => {',
					'		it("rejects an empty name", () => {',
					'			expect(name).toBe("");',
					"		});",
					"	});",
					"});"
				),
				filename,
				name: "describe.each when titles stay with the other when describes"
			},
			{
				code: lines(
					'describe("ExampleDto", () => {',
					'	describe("page", () => {',
					'		it("rejects 0", () => {',
					"			expect(page).toBe(0);",
					"		});",
					"	});",
					"",
					'	describe("name", () => {',
					'		it("rejects an empty name", () => {',
					'			expect(name).toBe("");',
					"		});",
					"	});",
					"});"
				),
				filename: "example.service.spec.ts",
				name: "a spec that is not a dto spec is ignored"
			}
		]
	};

	it.each(ruleCases.invalid)("$name", (testCase) => {
		expect.assertions(2);

		const result = lintRuleCase(orderedDtoTestGroupsRule, "ordered-dto-test-groups", testCase);

		expect(projectMessages(orderedDtoTestGroupsRule, result.messages, testCase.errors)).toStrictEqual(
			testCase.errors
		);
		expect(result.output).toBe(expectedOutput(testCase));
	});

	it.each(ruleCases.valid)("$name", (testCase) => {
		expect.assertions(2);

		const result = lintRuleCase(orderedDtoTestGroupsRule, "ordered-dto-test-groups", testCase);

		expect(projectMessages(orderedDtoTestGroupsRule, result.messages, [])).toStrictEqual([]);
		expect(result.output).toBe(expectedOutput(testCase));
	});
});
