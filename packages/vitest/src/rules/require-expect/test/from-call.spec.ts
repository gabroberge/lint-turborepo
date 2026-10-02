import { describe, expect, it } from "vitest";

import { arrow } from "../testing/arrow";
import { call } from "../testing/call";
import { identifier } from "../testing/identifier";
import { member } from "../testing/member";
import { title } from "../testing/title";
import { executableTestFromCall } from "./from-call";

describe(executableTestFromCall, () => {
	it("should return the inline it callback", () => {
		expect.assertions(1);

		const callback = arrow();
		const node = call(identifier("it"), [title("creates the transaction"), callback]);

		expect(executableTestFromCall(node)).toStrictEqual({ callback, callee: "it", node });
	});

	it("should return the inline test callback", () => {
		expect.assertions(1);

		const callback = arrow();
		const node = call(identifier("test"), [title("creates the transaction"), callback]);

		expect(executableTestFromCall(node)).toStrictEqual({ callback, callee: "test", node });
	});

	it("should accept the call that receives an each callback", () => {
		expect.assertions(1);

		const callback = arrow();
		const node = call(call(member(identifier("it"), "each"), []), [title("handles %s"), callback]);

		expect(executableTestFromCall(node)).toStrictEqual({ callback, callee: "it", node });
	});

	it("should ignore it.todo even with a callback", () => {
		expect.assertions(1);

		expect(executableTestFromCall(call(member(identifier("it"), "todo"), [title("pending"), arrow()]))).toBeNull();
	});

	it("should ignore a factory call", () => {
		expect.assertions(1);

		expect(executableTestFromCall(call(member(identifier("it"), "each"), []))).toBeNull();
	});

	it("should ignore a call with no callback", () => {
		expect.assertions(1);

		expect(executableTestFromCall(call(member(identifier("it"), "skip"), [title("pending")]))).toBeNull();
	});

	it("should ignore a callback passed by identifier", () => {
		expect.assertions(1);

		expect(executableTestFromCall(call(identifier("it"), [title("title"), identifier("myTest")]))).toBeNull();
	});
});
