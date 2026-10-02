import type { ESTree } from "@oxlint/plugins";
import { describe, expect, it } from "vitest";

import { call } from "../testing/call";
import { identifier } from "../testing/identifier";
import { member } from "../testing/member";
import { rootCallee } from "./root-callee";

describe(rootCallee, () => {
	it("should return an identifier callee", () => {
		expect.assertions(1);

		const expectId = identifier("expect");

		expect(rootCallee(expectId)).toBe(expectId);
	});

	it("should walk through a member expression", () => {
		expect.assertions(1);

		const expectId = identifier("expect");

		expect(rootCallee(member(expectId, "assertions"))).toBe(expectId);
	});

	it("should walk through a nested call", () => {
		expect.assertions(1);

		const expectId = identifier("expect");

		expect(rootCallee(member(call(expectId), "toBe"))).toBe(expectId);
	});

	it("should unwrap a parenthesized callee", () => {
		expect.assertions(1);

		const expectId = identifier("expect");

		expect(
			rootCallee({ expression: expectId, type: "ParenthesizedExpression" } as ESTree.ParenthesizedExpression)
		).toBe(expectId);
	});

	it("should stop at a non-expect identifier", () => {
		expect.assertions(1);

		const foo = identifier("foo");

		expect(rootCallee(member(foo, "expect"))).toBe(foo);
	});
});
