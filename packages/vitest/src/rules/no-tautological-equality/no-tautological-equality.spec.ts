import { describe, expect, it } from "vitest";

import { expectedOutput, lintRuleCase, projectMessages } from "../../rule-case";
import { noTautologicalEqualityRule } from "./no-tautological-equality";

const tautological = {
	messageId: "tautological" as const
};

describe("no-tautological-equality", () => {
	const ruleCases = {
		invalid: [
			{
				code: "expect(dto).toBe(dto);",
				errors: [tautological],
				name: "same identifier with toBe"
			},
			{
				code: "expect(dto).toEqual(dto);",
				errors: [tautological],
				name: "same identifier with toEqual"
			},
			{
				code: "expect(result).toStrictEqual(result);",
				errors: [tautological],
				name: "same identifier with toStrictEqual"
			},
			{
				code: "expect(dto).toEqual({ ...dto });",
				errors: [tautological],
				name: "object spread of same identifier"
			},
			{
				code: "expect(dto).toStrictEqual({ ...dto });",
				errors: [tautological],
				name: "toStrictEqual object spread of same identifier"
			},
			{
				code: "expect(dto).toEqual({ ...dto } satisfies UpdateNewsStatusDto);",
				errors: [tautological],
				name: "object spread with satisfies wrapper"
			},
			{
				code: "expect(dto).toEqual({ ...dto } as UpdateNewsStatusDto);",
				errors: [tautological],
				name: "object spread with as wrapper"
			},
			{
				code: "expect(dto!).toEqual(dto);",
				errors: [tautological],
				name: "non-null actual with same identifier expected"
			},
			{
				code: "expect((dto)).toEqual(dto);",
				errors: [tautological],
				name: "parenthesized actual with same identifier"
			},
			{
				code: "expect(items).toEqual([...items]);",
				errors: [tautological],
				name: "array spread of same identifier"
			},
			{
				code: "expect(result.data).toEqual(result.data);",
				errors: [tautological],
				name: "same safe member expression"
			},
			{
				code: "expect(result.data).toEqual({ ...result.data });",
				errors: [tautological],
				name: "object spread of same member expression"
			},
			{
				code: "expect(dto).not.toEqual(dto);",
				errors: [tautological],
				name: "not.toEqual same identifier"
			},
			{
				code: "expect(dto).toEqual({ ...(dto satisfies UpdateNewsStatusDto) });",
				errors: [tautological],
				name: "satisfies on spread argument"
			},
			{
				code: "expect(result?.data).toEqual(result?.data);",
				errors: [tautological],
				name: "optional chain member identity"
			},
			{
				code: "expect(1).toBe(1);",
				errors: [tautological],
				name: "same literal with toBe"
			}
		],
		valid: [
			{
				code: "expect(actual).toEqual(expected);",
				name: "different identifiers"
			},
			{
				code: 'expect(dto).toEqual({ title: "News title" });',
				name: "explicit expected object"
			},
			{
				code: 'expect(dto).toEqual({ ...dto, status: "active" });',
				name: "same spread plus additional property"
			},
			{
				code: "expect(dto).toEqual({ id: expectedId, ...dto });",
				name: "additional property followed by same spread"
			},
			{
				code: "expect(items).toEqual([...items, additionalItem]);",
				name: "array spread plus additional item"
			},
			{
				code: "expect(foo.bar).toEqual(foo.baz);",
				name: "different member expressions"
			},
			{
				code: "expect(getValue()).toEqual(getValue());",
				name: "identical call expressions are not flagged"
			},
			{
				code: "expect(dto).toBeInstanceOf(UpdateNewsStatusDto);",
				name: "non-equality matcher toBeInstanceOf"
			},
			{
				code: "expect(dto).toEqual({ ...other });",
				name: "spread of a different identifier"
			},
			{
				code: "expect(response.body).toEqualEntity(response.body);",
				name: "toEqualEntity is out of scope"
			},
			{
				code: "const expected = dto; expect(dto).toEqual(expected);",
				name: "same identifier via alias is not flagged"
			},
			{
				code: 'expect(result.data).toEqual(result["data"]);',
				name: "computed vs static member are not identical"
			},
			{
				code: "expect(items).toEqual([items]);",
				name: "array with only a non-spread element"
			},
			{
				code: "notExpect(dto).toEqual(dto);",
				name: "notExpect root is ignored"
			},
			{
				code: "expect(dto).toBe({ ...dto });",
				name: "toBe against a sole spread is reference inequality"
			},
			{
				code: "expect(1).toEqual({ ...1 });",
				name: "spreading a literal does not reproduce it"
			},
			{
				code: "expect(value).resolves.toEqual(value);",
				name: "resolves compares the settled value, not the expect argument"
			},
			{
				code: "expect(value).rejects.toEqual(value);",
				name: "rejects compares the settled value, not the expect argument"
			}
		]
	};

	it.each(ruleCases.invalid)("$name", (testCase) => {
		expect.assertions(2);

		const result = lintRuleCase(noTautologicalEqualityRule, "no-tautological-equality", testCase);

		expect(projectMessages(noTautologicalEqualityRule, result.messages, testCase.errors)).toStrictEqual(
			testCase.errors
		);
		expect(result.output).toBe(expectedOutput(testCase));
	});

	it.each(ruleCases.valid)("$name", (testCase) => {
		expect.assertions(2);

		const result = lintRuleCase(noTautologicalEqualityRule, "no-tautological-equality", testCase);

		expect(projectMessages(noTautologicalEqualityRule, result.messages, [])).toStrictEqual([]);
		expect(result.output).toBe(expectedOutput(testCase));
	});
});
