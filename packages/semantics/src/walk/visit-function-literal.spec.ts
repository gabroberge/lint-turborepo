import { describe, expect, it } from "vitest";

import { analyzeSource } from "../testing/analyze-source";
import { ANGULAR_ASSUMPTIONS } from "../testing/extraction-angular-assumptions";
import { describeUnit } from "../testing/extraction-lookup";
import { visitFunctionLiteral } from "./visit-function-literal";

/** The `function` facts of `Cart.run`, a method whose body (on line 5) is `body`, next to a setter `value`. */
function dispositions(body: string, imports = ""): string[] {
	return analyzeSource(`${imports}\nlet moduleLet;\nclass Cart {\n\tset value(v) {}\n\trun(param) { ${body} }\n}`, {
		assumptions: ANGULAR_ASSUMPTIONS
	})
		.facts("Cart.run")
		.filter((line) => line.startsWith("function"));
}

describe(visitFunctionLiteral, () => {
	describe("dispositions", () => {
		it.each([
			["const handlers = [() => 1];", "bound-locally"],
			["const handler = () => 1;", "bound-locally"],
			["const handler = param ?? (() => 1);", "bound-locally"],
			["function handler() {}", "bound-locally"],
			["(() => 1)();", "invoked"],
			["param.then(() => 1);", "passed-to-unknown"],
			["setTimeout(function () {});", "passed-to-unknown"],
			["return () => 1;", "passed-to-unknown"],
			["this.handler = () => 1;", "stored"],
			["this.handler ??= [() => 1];", "stored"],
			["Cart.shared = () => 1;", "stored"],
			["this[param] = () => 1;", "stored"],
			["moduleLet = () => 1;", "stored"],
			["let local;\nlocal = () => 1;", "bound-locally"],
			["this.value = () => 1;", "passed-to-unknown"],
			["globalThing = () => 1;", "passed-to-unknown"],
			["[this.handler] = [() => 1];", "passed-to-unknown"],
			["param.list = [() => 1];", "passed-to-unknown"],
			["({ run: () => 1 });", "passed-to-unknown"]
		])("should give the literal in %s the disposition %s", (body, disposition) => {
			expect.assertions(1);

			expect(dispositions(body).map((line) => line.split(":")[0])).toStrictEqual([`function ${disposition}`]);
		});

		it("should store a function literal that initializes a field, owned by the field", () => {
			expect.assertions(2);

			const { facts, model, unit } = analyzeSource("class Cart {\n\thandler = () => this.count;\n}");

			expect(facts("Cart.handler (initializer)")).toStrictEqual([
				"function stored: Cart.handler (initializer) > arrow (line 2)",
				"write Cart.handler"
			]);
			expect(describeUnit(model, unit("Cart.handler (initializer) > arrow (line 2)"))).toBe(
				"function | invocation | this: instance Cart | in Cart.handler (initializer) | of Cart.handler"
			);
		});

		it("should store an element of an object or array initializing a field", () => {
			expect.assertions(1);

			const { facts } = analyzeSource("class Cart {\n\thandlers = { a: () => 1, b: [function () {}] };\n}");

			expect(facts("Cart.handlers (initializer)")).toStrictEqual([
				"function stored: Cart.handlers (initializer) > arrow (line 2)",
				"function stored: Cart.handlers (initializer) > function (line 2)",
				"write Cart.handlers"
			]);
		});

		it("should pass a literal given to a call inside a field initializer to unknown code", () => {
			expect.assertions(1);

			const { facts } = analyzeSource("class Cart {\n\tsub = source.subscribe(() => 1);\n}");

			expect(facts("Cart.sub (initializer)")).toStrictEqual([
				"read global source (mutable)",
				"call property subscribe",
				"unknown call: source.subscribe",
				"function passed-to-unknown: Cart.sub (initializer) > arrow (line 2)",
				"write Cart.sub"
			]);
		});

		describe("when the assumptions describe the call", () => {
			it.each([
				["computed(() => 1);", "passed-to-assumed"],
				["inject(TOKEN, { factory: () => 1 });", "passed-to-assumed"],
				["unknownCall(() => 1);", "passed-to-unknown"]
			])("should give the literal in %s the disposition %s", (body, disposition) => {
				expect.assertions(1);

				expect(
					dispositions(body, 'import { computed, inject } from "@angular/core";').map(
						(line) => line.split(":")[0]
					)
				).toStrictEqual([`function ${disposition}`]);
			});

			it("should give a literal passed to an assumed call to the field it initializes", () => {
				expect.assertions(1);

				const { model, unit } = analyzeSource(
					'import { computed } from "@angular/core";\nclass Cart {\n\ttotal = computed(() => 1);\n}',
					{ assumptions: ANGULAR_ASSUMPTIONS }
				);

				expect(describeUnit(model, unit("Cart.total (initializer) > arrow (line 3)"))).toBe(
					"function | invocation | this: instance Cart | in Cart.total (initializer) | of Cart.total"
				);
			});
		});
	});

	describe("owners of assigned literals", () => {
		it.each([
			["this.handler = () => 1;", "Cart.run > arrow (line 5)", "of Cart.handler"],
			["Cart.shared = () => 1;", "Cart.run > arrow (line 5)", "of Cart.shared"],
			["moduleLet = () => 1;", "Cart.run > arrow (line 5)", "of moduleLet"],
			["this.undeclared = () => 1;", "Cart.run > arrow (line 5)", "of nothing"],
			["param.x = () => 1;", "Cart.run > arrow (line 5)", "of nothing"]
		])("should give the literal in %s (%s) the owner %s", (body, label, owner) => {
			expect.assertions(1);

			const { model, unit } = analyzeSource(
				`let moduleLet;\nclass Cart {\n\thandler = () => 0;\n\tstatic shared = null;\n\trun(param) { ${body} }\n}`
			);

			expect(describeUnit(model, unit(label))).toMatch(new RegExp(`\\| ${owner}$`, "u"));
		});
	});

	describe("receivers", () => {
		it.each([
			["class Cart { run() { return () => this; } }", "Cart.run > arrow (line 1)", "this: instance Cart"],
			["class Cart { static run() { return () => this; } }", "Cart.run > arrow (line 1)", "this: class Cart"],
			["class Cart { run() { return function () {}; } }", "Cart.run > function (line 1)", "this: unknown"],
			["class Cart { run() { function inner() {} } }", "Cart.run > function inner (line 1)", "this: unknown"],
			["const f = () => 1;", "module > arrow (line 1)", "this: none"],
			["function outer() { return () => 1; }", "outer > arrow (line 1)", "this: unknown"]
		])("should give the unit of %s labelled %s the receiver %s", (code, label, receiver) => {
			expect.assertions(1);

			const { model, unit } = analyzeSource(code);

			expect(describeUnit(model, unit(label))).toContain(`| ${receiver} |`);
		});
	});

	it("should root a function literal's unit at the literal itself and record its own facts there", () => {
		expect.assertions(3);

		const code = "class Cart {\n\tcount = 0;\n\trun() { return () => this.count; }\n}";
		const { facts, model, unit } = analyzeSource(code);
		const arrow = unit("Cart.run > arrow (line 3)");

		expect(arrow.code.map((root) => code.slice(...root.range))).toStrictEqual(["() => this.count"]);
		expect(facts("Cart.run")).toStrictEqual(["function passed-to-unknown: Cart.run > arrow (line 3)"]);
		expect(model.boundaries.has(arrow.node)).toBe(true);
	});

	it("should walk a parameter default in the function's own unit", () => {
		expect.assertions(1);

		const { facts } = analyzeSource(
			"class Cart {\n\tcount = 0;\n\trun(limit = this.count, { a = cap } = {}) {}\n}"
		);

		expect(facts("Cart.run")).toStrictEqual(["read Cart.count", "read global cap (mutable)"]);
	});
});
