import { describe, expect, it } from "vitest";

import type { ClassMember } from "../member/class-member";
import type { Newlines } from "../options/options";
import { memberStub } from "../testing/member-stub";
import { resolveTestOptions } from "../testing/resolve-test-options";
import { blankLinePolicy } from "./blank-line-policy";

interface Case {
	expected: Newlines;
	name: string;
	next: Partial<ClassMember>;
	previous: Partial<ClassMember>;
}

const METHOD = { category: "method", key: "run" } as const;

const CASES: Case[] = [
	{
		expected: "never",
		name: "glue an overload to the next signature",
		next: METHOD,
		previous: { ...METHOD, overload: true }
	},
	{
		expected: "always",
		name: "not glue an overload to another name",
		next: { ...METHOD, key: "stop" },
		previous: { ...METHOD, overload: true }
	},
	{
		expected: "always",
		name: "not glue an overload to a static member of the same name",
		next: { ...METHOD, static: true },
		previous: { ...METHOD, overload: true }
	},
	{
		expected: "always",
		name: "not glue an implementation to the next member of the same name",
		next: METHOD,
		previous: METHOD
	},
	{
		expected: "always",
		name: "not glue overloads with computed keys",
		next: { ...METHOD, key: null },
		previous: { ...METHOD, key: null, overload: true }
	},
	{
		expected: "never",
		name: "use the default spacing within a group",
		next: { category: "property", key: "b" },
		previous: { category: "property", key: "a" }
	},
	{
		expected: "always",
		name: "use the spacing of the group",
		next: { category: "method", key: "b" },
		previous: { category: "method", key: "a" }
	},
	{
		expected: "always",
		name: "use the spacing between groups",
		next: { category: "signal", key: "b" },
		previous: { category: "property", key: "a" }
	},
	{
		expected: "never",
		name: "share the spacing of combined categories",
		next: { category: "model", key: "b" },
		previous: { category: "input", key: "a" }
	}
];

describe(blankLinePolicy, () => {
	it.each(CASES)("should $name", ({ expected, next, previous }) => {
		expect.assertions(1);

		expect(blankLinePolicy(resolveTestOptions(), memberStub(previous), memberStub(next))).toBe(expected);
	});

	it("should glue an overload despite a spacing override", () => {
		expect.assertions(1);

		const options = resolveTestOptions({ newlinesWithin: "always" });

		expect(blankLinePolicy(options, memberStub({ ...METHOD, overload: true }), memberStub(METHOD))).toBe("never");
	});

	it("should use the configured spacing between groups", () => {
		expect.assertions(1);

		const options = resolveTestOptions({ newlinesBetween: "ignore" });

		expect(blankLinePolicy(options, memberStub({ category: "property" }), memberStub({ category: "method" }))).toBe(
			"ignore"
		);
	});
});
