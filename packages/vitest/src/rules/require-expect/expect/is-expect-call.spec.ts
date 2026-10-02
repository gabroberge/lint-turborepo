import { describe, expect, it } from "vitest";

import { call } from "../testing/call";
import { identifier } from "../testing/identifier";
import { member } from "../testing/member";
import { isExpectCall } from "./is-expect-call";

describe(isExpectCall, () => {
	it("should recognize expect()", () => {
		expect.assertions(1);

		expect(isExpectCall(call(identifier("expect")))).toBe(true);
	});

	it("should recognize expect(x).toBe()", () => {
		expect.assertions(1);

		expect(isExpectCall(call(member(call(identifier("expect")), "toBe")))).toBe(true);
	});

	it("should recognize expect.assertions()", () => {
		expect.assertions(1);

		expect(isExpectCall(call(member(identifier("expect"), "assertions")))).toBe(true);
	});

	it("should unwrap a parenthesized callee", () => {
		expect.assertions(1);

		expect(isExpectCall(call({ expression: identifier("expect"), type: "ParenthesizedExpression" }))).toBe(true);
	});

	it("should reject notExpect()", () => {
		expect.assertions(1);

		expect(isExpectCall(call(identifier("notExpect")))).toBe(false);
	});

	it("should reject foo.expect()", () => {
		expect.assertions(1);

		expect(isExpectCall(call(member(identifier("foo"), "expect")))).toBe(false);
	});
});
