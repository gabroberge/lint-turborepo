import { describe, expect, it } from "vitest";

import { arrow } from "../testing/arrow";
import { block } from "../testing/block";
import { factoryCall } from "../testing/factory-call";
import { identifier } from "../testing/identifier";
import { testCall } from "../testing/test-call";
import { testCallWithArgument } from "../testing/test-call-with-argument";
import { unknownCall } from "../testing/unknown-call";
import { comparableBodyFromCall } from "./comparable-body";

describe(comparableBodyFromCall, () => {
	describe("when the call is a recognized test with an inline callback", () => {
		it("returns the callback body", () => {
			expect.assertions(1);

			const body = block();
			const node = testCall("it", arrow(body));

			expect(comparableBodyFromCall(node)).toBe(body);
		});
	});

	describe("when the callee is test", () => {
		it("returns the callback body", () => {
			expect.assertions(1);

			const body = block();

			expect(comparableBodyFromCall(testCall("test", arrow(body)))).toBe(body);
		});
	});

	describe("when the callback is an expression arrow", () => {
		it("returns the expression", () => {
			expect.assertions(1);

			const body = identifier("value");

			expect(comparableBodyFromCall(testCall("it", arrow(body)))).toBe(body);
		});
	});

	describe("when the call has a modifier", () => {
		it("returns the callback body", () => {
			expect.assertions(1);

			const body = block();

			expect(comparableBodyFromCall(testCall("it", arrow(body), "skip"))).toBe(body);
		});
	});

	describe("when the call is a factory", () => {
		it("returns null", () => {
			expect.assertions(1);

			expect(comparableBodyFromCall(factoryCall("each"))).toBeNull();
		});
	});

	describe("when the call has no inline callback", () => {
		it("returns null", () => {
			expect.assertions(1);

			expect(comparableBodyFromCall(testCall("it"))).toBeNull();
		});
	});

	describe("when the callback is an identifier", () => {
		it("returns null", () => {
			expect.assertions(1);

			expect(comparableBodyFromCall(testCallWithArgument(identifier("run")))).toBeNull();
		});
	});

	describe("when the callee is not a test", () => {
		it("returns null", () => {
			expect.assertions(1);

			expect(comparableBodyFromCall(unknownCall())).toBeNull();
		});
	});
});
