import { describe, expect, it } from "vitest";

import { arrow } from "../testing/arrow";
import { call } from "../testing/call";
import { identifier } from "../testing/identifier";
import { numeric } from "../testing/numeric";
import { writtenCallbackFromCall } from "./written-callback-from-call";

describe(writtenCallbackFromCall, () => {
	it("should return the function written on the call", () => {
		expect.assertions(1);

		const callback = arrow();

		expect(writtenCallbackFromCall(call("beforeEach", [callback]))).toBe(callback);
	});

	it("should take the last function argument", () => {
		expect.assertions(1);

		const callback = arrow();

		expect(writtenCallbackFromCall(call("beforeEach", [numeric(1000), callback]))).toBe(callback);
	});

	it("should ignore a setup passed by identifier", () => {
		expect.assertions(1);

		expect(writtenCallbackFromCall(call("beforeEach", [identifier("arrange")]))).toBeNull();
	});
});
