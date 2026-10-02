import { describe, expect, it } from "vitest";

import { call } from "../testing/call";
import { identifier } from "../testing/identifier";
import { member } from "../testing/member";
import { eachCalleeName } from "./each-callee-name";

describe(eachCalleeName, () => {
	it("returns it for it.each", () => {
		expect.assertions(1);

		expect(eachCalleeName(member(identifier("it"), "each"))).toBe("it");
	});

	it("returns test for test.each", () => {
		expect.assertions(1);

		expect(eachCalleeName(member(identifier("test"), "each"))).toBe("test");
	});

	it("returns describe for describe.each", () => {
		expect.assertions(1);

		expect(eachCalleeName(member(identifier("describe"), "each"))).toBe("describe");
	});

	it("returns it for it.skip.each", () => {
		expect.assertions(1);

		expect(eachCalleeName(member(member(identifier("it"), "skip"), "each"))).toBe("it");
	});

	it("returns it for it.skipIf(condition).each", () => {
		expect.assertions(1);

		expect(eachCalleeName(member(call(member(identifier("it"), "skipIf"), identifier("condition")), "each"))).toBe(
			"it"
		);
	});

	it("returns null for it.for", () => {
		expect.assertions(1);

		expect(eachCalleeName(member(identifier("it"), "for"))).toBeNull();
	});

	it("returns null for a computed each access", () => {
		expect.assertions(1);

		expect(eachCalleeName(member(identifier("it"), "each", true))).toBeNull();
	});

	it("returns null for an unknown callee", () => {
		expect.assertions(1);

		expect(eachCalleeName(member(identifier("foo"), "each"))).toBeNull();
	});
});
