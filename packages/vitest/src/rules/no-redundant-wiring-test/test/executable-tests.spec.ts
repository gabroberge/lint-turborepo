import { describe, expect, it } from "vitest";

import { arrow } from "../testing/arrow";
import { block } from "../testing/block";
import { call } from "../testing/call";
import { expressionStatement } from "../testing/expression-statement";
import { functionNode } from "../testing/function-node";
import { identifier } from "../testing/identifier";
import { member } from "../testing/member";
import { title } from "../testing/title";
import { wiringArrow } from "../testing/wiring-arrow";
import { createExecutableTests } from "./executable-tests";

describe(createExecutableTests, () => {
	it("should record an executable wiring test", () => {
		expect.assertions(1);

		const tests = createExecutableTests();
		const callback = wiringArrow();
		const node = call(identifier("it"), [title("is defined"), callback]);
		const statement = expressionStatement(node);
		const suite = functionNode();
		tests.visitors.ExpressionStatement?.(statement);
		tests.record(node, suite);

		expect(tests.recorded()).toStrictEqual([
			{
				node,
				statement,
				suite,
				wiring: true
			}
		]);
	});

	it("should ignore a todo declaration", () => {
		expect.assertions(1);

		const tests = createExecutableTests();
		const node = call(member(identifier("it"), "todo"), [title("returns the result")]);
		tests.record(node, functionNode());

		expect(tests.recorded()).toStrictEqual([]);
	});

	it("should classify a behavioral body as not wiring", () => {
		expect.assertions(1);

		const tests = createExecutableTests();
		const callback = arrow(block(expressionStatement(call(identifier("worker"), []))));
		const node = call(identifier("it"), [title("runs"), callback]);
		tests.record(node, functionNode());

		expect(tests.recorded()[0]?.wiring).toBe(false);
	});
});
