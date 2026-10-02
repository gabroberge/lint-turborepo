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
import { recordExecutableTest } from "./record-executable-test";

describe(recordExecutableTest, () => {
	it("should record an executable wiring test", () => {
		expect.assertions(1);

		const callback = wiringArrow();
		const node = call(identifier("it"), [title("is defined"), callback]);
		const statement = expressionStatement(node);
		const suite = functionNode();

		expect(recordExecutableTest(node, suite, statement)).toStrictEqual({
			node,
			statement,
			suite,
			wiring: true
		});
	});

	it("should ignore a todo declaration", () => {
		expect.assertions(1);

		const node = call(member(identifier("it"), "todo"), [title("returns the result")]);

		expect(recordExecutableTest(node, functionNode(), null)).toBeNull();
	});

	it("should classify a behavioral body as not wiring", () => {
		expect.assertions(1);

		const callback = arrow(block(expressionStatement(call(identifier("worker"), []))));
		const node = call(identifier("it"), [title("runs"), callback]);

		expect(recordExecutableTest(node, functionNode(), null)?.wiring).toBe(false);
	});
});
