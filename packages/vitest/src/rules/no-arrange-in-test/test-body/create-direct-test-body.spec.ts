import { describe, expect, it } from "vitest";

import { functionNode } from "../testing/function-node";
import { createDirectTestBody } from "./create-direct-test-body";

describe(createDirectTestBody, () => {
	it("should own only a remembered current test callback", () => {
		expect.assertions(3);

		const testBody = createDirectTestBody();
		const callback = functionNode();

		expect(testBody.inDirectBody()).toBe(false);

		testBody.remember(callback);
		testBody.enterFunction(callback);

		expect(testBody.inDirectBody()).toBe(true);

		testBody.exitFunction(callback);

		expect(testBody.inDirectBody()).toBe(false);
	});

	it("should not own a nested function inside a remembered callback", () => {
		expect.assertions(3);

		const testBody = createDirectTestBody();
		const callback = functionNode();
		const nested = functionNode();

		testBody.remember(callback);
		testBody.enterFunction(callback);

		expect(testBody.inDirectBody()).toBe(true);

		testBody.enterFunction(nested);

		expect(testBody.inDirectBody()).toBe(false);

		testBody.exitFunction(nested);

		expect(testBody.inDirectBody()).toBe(true);
	});

	it("should not own an ordinary function that was never remembered", () => {
		expect.assertions(1);

		const testBody = createDirectTestBody();

		testBody.enterFunction(functionNode());

		expect(testBody.inDirectBody()).toBe(false);
	});
});
