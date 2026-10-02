import { describe, expect, it } from "vitest";

import { arrow } from "../testing/arrow";
import { call } from "../testing/call";
import { memberCall } from "../testing/member-call";
import { isBeforeEachCall } from "./is-before-each-call";

describe(isBeforeEachCall, () => {
	it("should accept beforeEach", () => {
		expect.assertions(1);

		expect(isBeforeEachCall(call("beforeEach", [arrow()]))).toBe(true);
	});

	it("should reject beforeAll", () => {
		expect.assertions(1);

		expect(isBeforeEachCall(call("beforeAll", [arrow()]))).toBe(false);
	});

	it("should reject afterEach", () => {
		expect.assertions(1);

		expect(isBeforeEachCall(call("afterEach", [arrow()]))).toBe(false);
	});

	it("should reject a member form", () => {
		expect.assertions(1);

		expect(isBeforeEachCall(memberCall("beforeEach", "skip", [arrow()]))).toBe(false);
	});
});
