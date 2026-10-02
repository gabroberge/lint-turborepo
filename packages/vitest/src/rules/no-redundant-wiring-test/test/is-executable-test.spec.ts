import { describe, expect, it } from "vitest";

import { arrow } from "../testing/arrow";
import { call } from "../testing/call";
import { identifier } from "../testing/identifier";
import { member } from "../testing/member";
import { title } from "../testing/title";
import { isExecutableTest } from "./is-executable-test";

describe(isExecutableTest, () => {
	it("should accept an it callback", () => {
		expect.assertions(1);

		expect(isExecutableTest(call(identifier("it"), [title("is defined"), arrow()]))).toBe(true);
	});

	it("should accept a test callback", () => {
		expect.assertions(1);

		expect(isExecutableTest(call(identifier("test"), [title("is defined"), arrow()]))).toBe(true);
	});

	it("should accept a callback passed by identifier", () => {
		expect.assertions(1);

		expect(isExecutableTest(call(identifier("it"), [title("is defined"), identifier("runCase")]))).toBe(true);
	});

	it("should accept a callback passed by member", () => {
		expect.assertions(1);

		expect(
			isExecutableTest(call(identifier("it"), [title("is defined"), member(identifier("helpers"), "run")]))
		).toBe(true);
	});

	it("should accept a skipped test with a callback", () => {
		expect.assertions(1);

		expect(isExecutableTest(call(member(identifier("it"), "skip"), [title("is defined"), arrow()]))).toBe(true);
	});

	it("should accept the call that receives an each callback", () => {
		expect.assertions(1);

		expect(isExecutableTest(call(call(member(identifier("it"), "each"), []), [title("returns %s"), arrow()]))).toBe(
			true
		);
	});

	it("should reject it.todo even with a callback", () => {
		expect.assertions(1);

		expect(isExecutableTest(call(member(identifier("it"), "todo"), [title("returns the result"), arrow()]))).toBe(
			false
		);
	});

	it("should reject a factory call", () => {
		expect.assertions(1);

		expect(isExecutableTest(call(member(identifier("it"), "each"), []))).toBe(false);
	});

	it("should reject a skipped test without a callback", () => {
		expect.assertions(1);

		expect(isExecutableTest(call(member(identifier("it"), "skip"), [title("returns the result")]))).toBe(false);
	});

	it("should reject a call that is not it or test", () => {
		expect.assertions(1);

		expect(isExecutableTest(call(identifier("describe"), [title("Worker"), arrow()]))).toBe(false);
	});
});
