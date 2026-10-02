import type { ESTree } from "@oxlint/plugins";
import { describe, expect, it } from "vitest";

import { call } from "../testing/call";
import { expectCall } from "../testing/expect-call";
import { expectDefined } from "../testing/expect-defined";
import { expectMatcher } from "../testing/expect-matcher";
import { identifier } from "../testing/identifier";
import { member } from "../testing/member";
import { isToBeDefinedAssertion } from "./is-to-be-defined-assertion";

describe(isToBeDefinedAssertion, () => {
	it("should accept expect(value).toBeDefined()", () => {
		expect.assertions(1);

		expect(isToBeDefinedAssertion(expectDefined())).toBe(true);
	});

	it("should accept a parenthesized assertion", () => {
		expect.assertions(1);

		expect(
			isToBeDefinedAssertion({
				expression: expectDefined(),
				type: "ParenthesizedExpression"
			} as ESTree.ParenthesizedExpression)
		).toBe(true);
	});

	it("should accept a non-null value", () => {
		expect.assertions(1);

		expect(
			isToBeDefinedAssertion(
				expectDefined({
					expression: identifier("worker"),
					type: "TSNonNullExpression"
				})
			)
		).toBe(true);
	});

	it("should reject a different matcher", () => {
		expect.assertions(1);

		expect(isToBeDefinedAssertion(expectMatcher("toBe"))).toBe(false);
	});

	it("should reject expect.not.toBeDefined", () => {
		expect.assertions(1);

		expect(
			isToBeDefinedAssertion(
				call(member(member(call(identifier("expect"), [identifier("worker")]), "not"), "toBeDefined"), [])
			)
		).toBe(false);
	});

	it("should reject a matcher argument", () => {
		expect.assertions(1);

		expect(isToBeDefinedAssertion(call(member(expectCall(), "toBeDefined"), [identifier("extra")]))).toBe(false);
	});

	it("should reject expect() with no value", () => {
		expect.assertions(1);

		expect(isToBeDefinedAssertion(call(member(call(identifier("expect"), []), "toBeDefined"), []))).toBe(false);
	});

	it("should reject a spread expect argument", () => {
		expect.assertions(1);

		expect(
			isToBeDefinedAssertion(
				call(
					member(
						call(identifier("expect"), [{ argument: identifier("values"), type: "SpreadElement" }]),
						"toBeDefined"
					),
					[]
				)
			)
		).toBe(false);
	});

	it("should reject optional toBeDefined", () => {
		expect.assertions(1);

		expect(isToBeDefinedAssertion(call(member(expectCall(), "toBeDefined", { optional: true }), []))).toBe(false);
	});

	it("should reject computed toBeDefined", () => {
		expect.assertions(1);

		expect(isToBeDefinedAssertion(call(member(expectCall(), "toBeDefined", { computed: true }), []))).toBe(false);
	});

	it("should reject a callee that is not expect", () => {
		expect.assertions(1);

		expect(
			isToBeDefinedAssertion(call(member(call(identifier("assert"), [identifier("worker")]), "toBeDefined"), []))
		).toBe(false);
	});
});
