import { describe, expect, it } from "vitest";

import { callExpression } from "../testing/call-expression";
import { identifier } from "../testing/identifier";
import { decoratorTarget } from "./decorator-target";

describe(decoratorTarget, () => {
	describe("when the expression is a call", () => {
		it("returns the callee", () => {
			expect.assertions(1);

			const callee = identifier("Controller");

			expect(decoratorTarget(callExpression(callee))).toBe(callee);
		});
	});

	describe("when the expression is not a call", () => {
		it("returns the expression", () => {
			expect.assertions(1);

			const expression = identifier("Controller");

			expect(decoratorTarget(expression)).toBe(expression);
		});
	});
});
