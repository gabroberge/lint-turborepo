import { describe, expect, it } from "vitest";

import { arrow } from "../testing/arrow";
import { call } from "../testing/call";
import { functionNode } from "../testing/function-node";
import { identifier } from "../testing/identifier";
import { createBeforeEachOwnership } from "./create-ownership";

describe(createBeforeEachOwnership, () => {
	it("should own only a marked current function", () => {
		expect.assertions(3);

		const ownership = createBeforeEachOwnership();
		const callback = functionNode();

		expect(ownership.inDirectBeforeEach()).toBe(false);

		ownership.mark(callback);
		ownership.enterFunction(callback);

		expect(ownership.inDirectBeforeEach()).toBe(true);

		ownership.exitFunction(callback);

		expect(ownership.inDirectBeforeEach()).toBe(false);
	});

	it("should not own a nested function inside a marked callback", () => {
		expect.assertions(3);

		const ownership = createBeforeEachOwnership();
		const callback = functionNode();
		const nested = functionNode();

		ownership.mark(callback);
		ownership.enterFunction(callback);

		expect(ownership.inDirectBeforeEach()).toBe(true);

		ownership.enterFunction(nested);

		expect(ownership.inDirectBeforeEach()).toBe(false);

		ownership.exitFunction(nested);

		expect(ownership.inDirectBeforeEach()).toBe(true);
	});

	it("should not own an unmarked function", () => {
		expect.assertions(1);

		const ownership = createBeforeEachOwnership();

		ownership.enterFunction(functionNode());

		expect(ownership.inDirectBeforeEach()).toBe(false);
	});

	it("should own the function written on beforeEach after note", () => {
		expect.assertions(1);

		const ownership = createBeforeEachOwnership();
		const callback = arrow();

		ownership.note(call("beforeEach", [callback]));
		ownership.enterFunction(callback);

		expect(ownership.inDirectBeforeEach()).toBe(true);
	});

	it("should not own a function written on beforeAll after note", () => {
		expect.assertions(1);

		const ownership = createBeforeEachOwnership();
		const callback = arrow();

		ownership.note(call("beforeAll", [callback]));
		ownership.enterFunction(callback);

		expect(ownership.inDirectBeforeEach()).toBe(false);
	});

	it("should not own a named setup passed to beforeEach after note", () => {
		expect.assertions(1);

		const ownership = createBeforeEachOwnership();
		const setup = functionNode();

		ownership.note(call("beforeEach", [identifier("arrange")]));
		ownership.enterFunction(setup);

		expect(ownership.inDirectBeforeEach()).toBe(false);
	});
});
