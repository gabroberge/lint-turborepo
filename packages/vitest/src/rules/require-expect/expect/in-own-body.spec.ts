import { describe, expect, it } from "vitest";

import { arrow } from "../testing/arrow";
import { block } from "../testing/block";
import { expectCall } from "../testing/expect-call";
import { expressionStatement } from "../testing/expression-statement";
import { identifier } from "../testing/identifier";
import { expectInOwnBody } from "./in-own-body";

describe(expectInOwnBody, () => {
	it("should find expect in the callback body", () => {
		expect.assertions(1);

		expect(expectInOwnBody(arrow(block(expressionStatement(expectCall()))))).toBe(true);
	});

	it("should find expect in an expression-body arrow", () => {
		expect.assertions(1);

		expect(expectInOwnBody(arrow(expectCall()))).toBe(true);
	});

	it("should find expect inside ordinary control flow", () => {
		expect.assertions(1);

		const branch = {
			consequent: block(expressionStatement(expectCall())),
			test: identifier("ok"),
			type: "IfStatement"
		};

		expect(expectInOwnBody(arrow(block(branch)))).toBe(true);
	});

	it("should find expect in a default parameter of the callback", () => {
		expect.assertions(1);

		const param = {
			left: identifier("value"),
			right: expectCall(),
			type: "AssignmentPattern"
		};

		expect(expectInOwnBody(arrow(block(), [param]))).toBe(true);
	});

	it("should ignore expect inside a nested arrow", () => {
		expect.assertions(1);

		const nested = arrow(block(expressionStatement(expectCall())));

		expect(expectInOwnBody(arrow(block(expressionStatement(nested))))).toBe(false);
	});

	it("should ignore expect inside a nested function declaration", () => {
		expect.assertions(1);

		const nested = {
			async: false,
			body: block(expressionStatement(expectCall())),
			generator: false,
			id: identifier("assertAccount"),
			params: [],
			type: "FunctionDeclaration"
		};

		expect(expectInOwnBody(arrow(block(nested)))).toBe(false);
	});

	it("should ignore an empty body", () => {
		expect.assertions(1);

		expect(expectInOwnBody(arrow(block()))).toBe(false);
	});
});
