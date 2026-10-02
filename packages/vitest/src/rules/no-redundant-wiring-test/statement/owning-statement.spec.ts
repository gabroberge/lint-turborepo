import { describe, expect, it } from "vitest";

import { expressionStatement } from "../testing/expression-statement";
import { identifierCall } from "../testing/identifier-call";
import { createOwningStatement } from "./owning-statement";

describe(createOwningStatement, () => {
	it("should own a call that is the whole current statement", () => {
		expect.assertions(1);

		const statements = createOwningStatement();
		const call = identifierCall("it");
		const statement = expressionStatement(call);
		statements.visitors.ExpressionStatement?.(statement);

		expect(statements.of(call)).toBe(statement);
	});

	it("should not own a call nested inside the statement expression", () => {
		expect.assertions(1);

		const statements = createOwningStatement();
		const inner = identifierCall("it");
		const statement = expressionStatement(identifierCall("wrapper"));
		statements.visitors.ExpressionStatement?.(statement);

		expect(statements.of(inner)).toBeNull();
	});

	it("should not own a call after the statement exits", () => {
		expect.assertions(1);

		const statements = createOwningStatement();
		const call = identifierCall("it");
		const statement = expressionStatement(call);
		statements.visitors.ExpressionStatement?.(statement);
		statements.visitors["ExpressionStatement:exit"]?.(statement);

		expect(statements.of(call)).toBeNull();
	});
});
