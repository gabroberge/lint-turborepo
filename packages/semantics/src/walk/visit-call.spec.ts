import { describe, expect, it } from "vitest";

import { analyzeSource } from "../testing/analyze-source";
import { analyzeTsxFacts } from "../testing/extraction-analyze-tsx";
import { ANGULAR_ASSUMPTIONS } from "../testing/extraction-angular-assumptions";
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
			[
				"const local = () => 1;\nlocal();",
				["function bound-locally: Cart.run > arrow (line 12)", "call unit Cart.run > arrow (line 12)"]
			],
			[
				"function local() {}\nlocal();",
				[
					"function bound-locally: Cart.run > function local (line 12)",
					"call unit Cart.run > function local (line 12)"
				]
			],
			[
				"local();\nfunction local() {}",
				[
					"call unit Cart.run > function local (line 13)",
					"function bound-locally: Cart.run > function local (line 13)"
				]
			],
			["const local = param;\nlocal();", ["unknown call: local()"]],
			[
				"const { local } = () => 1;\nlocal();",
				["function bound-locally: Cart.run > arrow (line 12)", "unknown call: local()"]
			],
			[
				"let local = () => 1;\nlocal = param;\nlocal();",
				["function bound-locally: Cart.run > arrow (line 12)", "unknown call: local()"]
			]
		])("should record %s as %j", (body, expected) => {
			expect.assertions(1);

			expect(runFacts(body)).toStrictEqual(expected);
		});

		it("should call a named function expression's own unit through its own name", () => {
			expect.assertions(1);

			const { facts } = analyzeSource("const f = function g(n) { return n ? g(n - 1) : 0; };");

			expect(facts("module > function g (line 1)")).toStrictEqual(["call unit module > function g (line 1)"]);
		});

		it("should call the unit of a local arrow function", () => {
			expect.assertions(1);

			const { facts } = analyzeSource("export function f() { const g = () => 1; g(); }");

			expect(facts("f")).toStrictEqual([
				"function bound-locally: f > arrow (line 1)",
				"call unit f > arrow (line 1)"
			]);
		});

		it("should keep calling a local of an enclosing function a closure call", () => {
			expect.assertions(1);

			const { facts } = analyzeSource("export function f() {\n\tconst g = () => 1;\n\treturn () => g();\n}");

			expect(facts("f > arrow (line 3)")).toStrictEqual(["call closure g", "unknown call: g()"]);
		});
	});

	describe("member callees", () => {
		it.each([
			["this.load();", ["call Cart.load"]],
			["this.count();", ["call Cart.count", "unknown call: this.count"]],
			["this.missing?.();", ["call Cart.missing (undeclared)", "unknown call: this.missing"]],
			["Base.create();", ["call static Base.create (undeclared)", "unknown call: Base.create"]],
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

	describe("member callees the model cannot follow", () => {
		/** The facts of `A.run`, whose body is `this.x();` (or `call`), next to `members`. */
		function callFacts(members: string, call = "this.x();"): string[] {
			return analyzeSource(
				`import { signal } from "@angular/core";\nexport class A {\n${members}\n\trun() { ${call} }\n}`,
				{ assumptions: ANGULAR_ASSUMPTIONS }
			).facts("A.run");
		}

		it.each([
			["x() {}", ["call A.x"]],
			["x = () => 1;", ["call A.x"]],
			["x = signal(0);", ["call A.x"]],
			["accessor x = () => 1;", ["call A.x"]],
			["get x() { return () => 1; }", ["call A.x", "unknown call: this.x"]],
			["get x() { return () => 1; }\nset x(v) {}", ["call A.x", "unknown call: this.x"]],
			["x(): void;", ["call A.x", "unknown call: this.x"]],
			["x;", ["call A.x", "unknown call: this.x"]],
			["x = make();", ["call A.x", "unknown call: this.x"]],
			["constructor(private x: () => void) {}", ["call A.x", "unknown call: this.x"]],
			[
				"handler = () => {};\nset(fn) { this.handler = fn; }",
				["call A.handler", "unknown call: this.handler"],
				"this.handler();"
			]
		])("should record calling the member declared by %s as %j", (members, expected, call = "this.x();") => {
			expect.assertions(1);

			expect(callFacts(members, call)).toStrictEqual(expected);
		});
	});

	describe("constructions", () => {
		it("should construct a module class without uncertainty", () => {
			expect.assertions(1);

			const { facts } = analyzeSource("class A { x = 1; }\nexport function make() { return new A(); }");

			expect(facts("make")).toStrictEqual(["construct module A"]);
		});

		it("should report the parent constructor of a derived module class as unknown", () => {
			expect.assertions(1);

			const { facts } = analyzeSource(
				"class A extends Base { x = 1; }\nexport function make() { return new A(); }"
			);

			expect(facts("make")).toStrictEqual(["construct module A", "unknown construct: new A()"]);
		});

		it("should construct a const-bound class expression through its binding", () => {
			expect.assertions(1);

			const { facts } = analyzeSource("const A = class {};\nexport function make() { return new A(1); }");

			expect(facts("make")).toStrictEqual(["construct module A"]);
		});

		it("should not resolve a reassigned class binding to the class", () => {
			expect.assertions(2);

			const { facts } = analyzeSource(
				"let A = class { static n = 1; };\nA = Other;\nexport function make() { A.n; return new A(); }"
			);

			expect(facts("make")).toStrictEqual([
				"read module A (mutable)",
				"read property n",
				"read module A (mutable)",
				"unknown construct: new A()"
			]);
			expect(analyzeSource("class A {}\nA = Other;\nnew A();").facts("module")).toStrictEqual([
				"write module A (mutable)",
				"read global Other (mutable)",
				"read module A (mutable)",
				"unknown construct: new A()"
			]);
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
			["new Base();", ["construct module Base"]],
			["new Cart();", ["construct module Cart", "unknown construct: new Cart()"]],
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

			expect(facts("Cart (definition)")).toStrictEqual([
				"call import Component",
				"unknown call: Component({})",
				"unknown call: @Component({})",
				"unknown receiver-escape: @Component({})"
			]);
		});

		it("should resolve imported member and parameter decorators to their imports", () => {
			expect.assertions(1);

			const { facts } = analyzeSource(
				'import { Inject, Input, TOKEN } from "lib";\nclass Cart {\n\t@Input() name = "";\n\tconstructor(@Inject(TOKEN) private readonly token: string) {}\n}'
			);

			expect(facts("Cart (definition)")).toStrictEqual([
				"call import Input",
				"unknown call: Input()",
				"unknown call: @Input()",
				"call import Inject",
				"unknown call: Inject(TOKEN)",
				"read import TOKEN",
				"unknown call: @Inject(TOKEN)"
			]);
		});

		it("should walk a method parameter decorator in the definition unit and apply it as an unknown call", () => {
			expect.assertions(1);

			const { facts } = analyzeSource(
				'import { Dec } from "d";\nlet counter = 0;\nexport class A {\n\tm(@Dec(counter++) x: number) {}\n}'
			);

			expect(facts("A (definition)")).toStrictEqual([
				"call import Dec",
				"unknown call: Dec(counter++)",
				"read module counter (mutable)",
				"write module counter (mutable)",
				"unknown call: @Dec(counter++)"
			]);
		});

		it("should walk setter and accessor parameter decorators too", () => {
			expect.assertions(1);

			const { facts } = analyzeSource(
				'import { Dec } from "d";\nclass A {\n\tset x(@Dec v) {}\n\tget y() { return 1; }\n\tstatic s(@Dec v) {}\n}'
			);

			expect(facts("A (definition)")).toStrictEqual([
				"read import Dec",
				"unknown call: @Dec",
				"read import Dec",
				"unknown call: @Dec"
			]);
		});

		it("should hand a class to a plain class decorator", () => {
			expect.assertions(1);

			const { facts } = analyzeSource(
				'import { register } from "r";\n@register\nexport class A { static n = 0; }'
			);

			expect(facts("A (definition)")).toStrictEqual([
				"read import register",
				"unknown call: @register",
				"unknown receiver-escape: @register"
			]);
		});

		it("should apply a decorator the assumptions describe without uncertainty", () => {
			expect.assertions(1);

			const { facts } = analyzeSource(
				'import { inject } from "@angular/core";\n@inject({ a: () => 1 })\nclass A { @inject() x = 1; }',
				{ assumptions: ANGULAR_ASSUMPTIONS }
			);

			expect(facts("A (definition)")).toStrictEqual([
				"function passed-to-assumed: A (definition) > arrow (line 2)"
			]);
		});
	});
});
