import type { FunctionNode } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";
import { describe, expect, it } from "vitest";

import { arrow } from "../testing/arrow";
import { block } from "../testing/block";
import { call } from "../testing/call";
import { expectDefined } from "../testing/expect-defined";
import { expressionStatement } from "../testing/expression-statement";
import { identifier } from "../testing/identifier";
import { member } from "../testing/member";
import { isMinimalWiringBody } from "./is-minimal-wiring-body";

describe(isMinimalWiringBody, () => {
	it("should accept an expression-bodied toBeDefined", () => {
		expect.assertions(1);

		expect(isMinimalWiringBody(arrow(expectDefined()))).toBe(true);
	});

	it("should accept a block of toBeDefined statements", () => {
		expect.assertions(1);

		expect(
			isMinimalWiringBody(
				arrow(block(expressionStatement(expectDefined()), expressionStatement(expectDefined())))
			)
		).toBe(true);
	});

	it("should reject an empty block", () => {
		expect.assertions(1);

		expect(isMinimalWiringBody(arrow(block()))).toBe(false);
	});

	it("should reject a missing body", () => {
		expect.assertions(1);

		expect(isMinimalWiringBody({ body: null, type: "FunctionExpression" } as FunctionNode)).toBe(false);
	});

	it("should reject another matcher in the block", () => {
		expect.assertions(1);

		expect(
			isMinimalWiringBody(
				arrow(
					block(
						expressionStatement(expectDefined()),
						expressionStatement(
							call(member(call(identifier("expect"), [identifier("worker")]), "toBe"), [])
						)
					)
				)
			)
		).toBe(false);
	});

	it("should reject a non-assertion statement", () => {
		expect.assertions(1);

		expect(
			isMinimalWiringBody(
				arrow(
					block({
						expression: call(member(identifier("worker"), "run"), []),
						type: "ExpressionStatement"
					} as ESTree.ExpressionStatement)
				)
			)
		).toBe(false);
	});
});
