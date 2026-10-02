import { describe, expect, it } from "vitest";

import { analyzeSource } from "../testing/analyze-source";
import { analyzeTsxFacts } from "../testing/extraction-analyze-tsx";
import { visitCall } from "./visit-call";

const PRELUDE = `import { helper, ns } from "lib";
function follow() {}
const arrow = () => 1;
let swapped = () => 1;
swapped = () => 2;
const value = 1;
class Base {}
`;

/** The facts of `Cart.run`, an async method whose body is `body`. */
function runFacts(body: string): string[] {
	return analyzeSource(
		`${PRELUDE}class Cart extends Base {\n\tcount = 0;\n\tload() {}\n\tasync run(param) {\n${body}\n\t}\n}`
	).facts("Cart.run");
}

describe(visitCall, () => {
	describe("named callees", () => {
		it.each([
			["follow();", ["call module follow"]],
			["arrow();", ["call module arrow"]],
			["swapped();", ["call module swapped (mutable)", "unknown call: swapped()"]],
			["value();", ["call module value", "unknown call: value()"]],
			["helper();", ["call import helper", "unknown call: helper()"]],
			["fetch();", ["call global fetch (mutable)", "unknown call: fetch()"]],
			["param();", ["unknown call: param()"]],
			[
				"follow(this.count, stable => 1);",
				["call module follow", "read Cart.count", "function passed-to-unknown: Cart.run > arrow (line 12)"]
			]
		])("should record %s as %j", (body, expected) => {
			expect.assertions(1);

			expect(runFacts(body)).toStrictEqual(expected);
		});

		it("should follow a call of a closure binding nowhere: it is always unknown", () => {
			expect.assertions(1);

			const { facts } = analyzeSource("function outer() {\n\tconst inner = () => 1;\n\treturn () => inner();\n}");

			expect(facts("outer > arrow (line 3)")).toStrictEqual(["call closure inner", "unknown call: inner()"]);
		});
	});

	describe("local callees", () => {
		it.each([
			["const local = () => 1;\nlocal();", ["function bound-locally: Cart.run > arrow (line 12)"]],
			["function local() {}\nlocal();", ["function bound-locally: Cart.run > function local (line 12)"]],
			["const local = param;\nlocal();", ["unknown call: local()"]],
			[
				"let local = () => 1;\nlocal = param;\nlocal();",
				["function bound-locally: Cart.run > arrow (line 12)", "unknown call: local()"]
			]
		])("should record %s as %j", (body, expected) => {
			expect.assertions(1);

			expect(runFacts(body)).toStrictEqual(expected);
		});

		it("should know a named function expression's own name inside it", () => {
			expect.assertions(1);

			const { facts } = analyzeSource("const f = function self(n) { return n && self(n - 1); };");

			expect(facts("module > function self (line 1)")).toStrictEqual([]);
		});
	});

	describe("member callees", () => {
		it.each([
			["this.load();", ["call Cart.load"]],
			["this.count();", ["call Cart.count"]],
			["this.missing?.();", ["call Cart.missing (undeclared)"]],
			["Base.create();", ["call static Base.create (undeclared)"]],
			["ns.make();", ["read import ns", "call property make", "unknown call: ns.make"]],
			[
				"param.items.push(this.count);",
				["call property push", "unknown call: param.items.push", "read Cart.count"]
			],
			[
				"this.items?.push(1);",
				["read Cart.items (undeclared)", "call property push", "unknown call: this.items?.push"]
			]
		])("should record %s as %j", (body, expected) => {
			expect.assertions(1);

			expect(runFacts(body).filter((line) => line !== "read property items")).toStrictEqual(expected);
		});
	});

	describe("function literal callees", () => {
		it.each([
			["(() => this.count)();", ["function invoked: Cart.run > arrow (line 12)"]],
			["(function () {})();", ["function invoked: Cart.run > function (line 12)"]],
			["(async () => {})();", ["function invoked: Cart.run > arrow (line 12)"]]
		])("should record %s as %j", (body, expected) => {
			expect.assertions(1);

			expect(runFacts(body)).toStrictEqual(expected);
		});
	});

	describe("code outside the model", () => {
		it.each([
			["new Base();", ["read module Base", "unknown construct: new Base()"]],
			[
				"new Map(this.count);",
				["read global Map (mutable)", "unknown construct: new Map(this.count)", "read Cart.count"]
			],
			["super.load();", ["unknown super: super.load"]],
			['eval("x");', ['unknown eval: eval("x")']],
			['window.eval("x");', ["read global window (mutable)", "call property eval", "unknown call: window.eval"]],
			[
				"tag`a${this.count}`;",
				["read global tag (mutable)", "read Cart.count", "unknown tagged-template: tag`a${this.count}`"]
			],
			['import("./mod");', ['unknown dynamic-import: import("./mod")']],
			["delete this.count;", ["write Cart.count", "unknown delete: delete this.count"]],
			["delete param.x;", ["write property x", "unknown delete: delete param.x"]],
			["await param;", ["unknown suspension: await param"]],
			["for await (const item of param) {}", ["unknown suspension: for await (const item of param) {}"]],
			["(param as () => void)();", ["unknown call: (param as () => void)()"]],
			["param.list[0]();", ["read property list", "call property 0", "unknown call: param.list[0]"]]
		])("should record %s as %j", (body, expected) => {
			expect.assertions(1);

			expect(runFacts(body)).toStrictEqual(expected);
		});

		it("should report a direct eval only for the global eval", () => {
			expect.assertions(1);

			const { facts } = analyzeSource('function f(eval) { eval("x"); }');

			expect(facts("f")).toStrictEqual(['unknown call: eval("x")']);
		});

		it("should report super() in a constructor", () => {
			expect.assertions(1);

			expect(
				analyzeSource("class A extends B { constructor() { super(); } }").facts("A.constructor")
			).toStrictEqual(["unknown super: super()"]);
		});

		it("should report yield and yield* as suspensions", () => {
			expect.assertions(1);

			expect(analyzeSource("function* gen() { yield 1; yield* other; }").facts("gen")).toStrictEqual([
				"unknown suspension: yield 1",
				"read global other (mutable)",
				"unknown suspension: yield* other"
			]);
		});

		it("should report a JSX element as an unknown call and walk its expressions", () => {
			expect.assertions(1);

			expect(
				analyzeTsxFacts(
					"let n = 0;\nn++;\nfunction View() { return <div title={n}>{n}<></></div>; }",
					"View"
				).toSorted((left, right) => left.localeCompare(right))
			).toStrictEqual([
				"read module n (mutable)",
				"read module n (mutable)",
				"unknown call: <></>",
				"unknown call: <div title={n}>{n}<></></div>"
			]);
		});
	});

	describe("decorators", () => {
		it("should resolve an imported class decorator to its import", () => {
			expect.assertions(1);

			const { facts } = analyzeSource(
				'import { Component } from "@angular/core";\n@Component({})\nclass Cart {}'
			);

			expect(facts("Cart (definition)")).toStrictEqual(["call import Component", "unknown call: Component({})"]);
		});

		it("should resolve imported member and parameter decorators to their imports", () => {
			expect.assertions(1);

			const { facts } = analyzeSource(
				'import { Inject, Input, TOKEN } from "lib";\nclass Cart {\n\t@Input() name = "";\n\tconstructor(@Inject(TOKEN) private readonly token: string) {}\n}'
			);

			expect(facts("Cart (definition)")).toStrictEqual([
				"call import Input",
				"unknown call: Input()",
				"call import Inject",
				"unknown call: Inject(TOKEN)",
				"read import TOKEN"
			]);
		});
	});
});
