import { describe, expect, it } from "vitest";

import type { UnknownReason } from "../index";
import { analyzeSource } from "../testing/analyze-source";
import { analyzeTsxFacts } from "../testing/extraction-analyze-tsx";
import { emitUnknown } from "./emit-unknown";

/** The `unknown` facts of the unit labelled `label` in `code`. */
function unknowns(code: string, label: string): string[] {
	return analyzeSource(code)
		.facts(label)
		.filter((line) => line.startsWith("unknown"));
}

/** One realistic snippet per reason, with the unit to look at and the uncertainty it must produce. */
const REASONS: [UnknownReason, string, string, string][] = [
	["call", "class Cart { run() { fetch(); } }", "Cart.run", "unknown call: fetch()"],
	["construct", "class Cart { run() { new Date(); } }", "Cart.run", "unknown construct: new Date()"],
	["delete", "class Cart { run(map) { delete map.key; } }", "Cart.run", "unknown delete: delete map.key"],
	["dynamic-import", 'class Cart { run() { import("./x"); } }', "Cart.run", 'unknown dynamic-import: import("./x")'],
	["dynamic-member", "class Cart { run(key) { this[key]; } }", "Cart.run", "unknown dynamic-member: this[key]"],
	["eval", 'class Cart { run() { eval("1"); } }', "Cart.run", 'unknown eval: eval("1")'],
	["receiver-escape", "class Cart { run() { register(this); } }", "Cart.run", "unknown receiver-escape: this"],
	["super", "class Cart extends Base { run() { super.run(); } }", "Cart.run", "unknown super: super.run"],
	["suspension", "class Cart { async run(job) { await job; } }", "Cart.run", "unknown suspension: await job"],
	["tagged-template", "class Cart { run() { sql`x`; } }", "Cart.run", "unknown tagged-template: sql`x`"],
	[
		"unanalyzed-declaration",
		"class Cart { run() { class Inner {} } }",
		"Cart.run",
		"unknown unanalyzed-declaration: class Inner {}"
	],
	[
		"unknown-receiver",
		"const f = function () { return this.x; };",
		"module > function (line 1)",
		"unknown unknown-receiver: this.x"
	],
	["unsupported-target", "class Cart { run() { f() = 1; } }", "Cart.run", "unknown unsupported-target: f()"]
];

describe(emitUnknown, () => {
	it.each(REASONS)("should reach the reason %s from %s", (_reason, code, label, expected) => {
		expect.assertions(1);

		expect(unknowns(code, label)).toContain(expected);
	});

	it("should cover every reason exactly once in the table above", () => {
		expect.assertions(1);

		expect(new Set(REASONS.map(([reason]) => reason)).size).toBe(REASONS.length);
	});

	describe("receiver-escape", () => {
		it.each([
			["class Cart { run() { return this; } }", "Cart.run"],
			["class Cart { run() { const self = this; } }", "Cart.run"],
			["class Cart { run(cb) { cb.call(this); } }", "Cart.run"],
			["class Cart { run() { return () => this; } }", "Cart.run > arrow (line 1)"],
			["class Cart { static run() { register(this); } }", "Cart.run"],
			["class Cart { handler = this; }", "Cart.handler (initializer)"]
		])("should report a bare this handed out in %s", (code, label) => {
			expect.assertions(1);

			expect(unknowns(code, label)).toContain("unknown receiver-escape: this");
		});

		it.each([
			["class Cart { static run() { register(Cart); } }", "Cart.run"],
			["class Cart { static run() { return Cart; } }", "Cart.run"],
			["class Cart { static self = Cart; }", "Cart.self (initializer)"],
			["class Cart { static { register(Cart); } }", "Cart.static block"]
		])("should report the class used as a value in its own static code in %s", (code, label) => {
			expect.assertions(1);

			expect(unknowns(code, label)).toContain("unknown receiver-escape: Cart");
		});

		it("should report new of the class in its own static code as a receiver escape and a construct", () => {
			expect.assertions(1);

			expect(unknowns("class Cart { static make() { return new Cart(); } }", "Cart.make")).toStrictEqual([
				"unknown receiver-escape: Cart",
				"unknown construct: new Cart()"
			]);
		});

		it("should not report the class's name used as a value in instance code, which is a module binding read", () => {
			expect.assertions(1);

			expect(analyzeSource("class Cart { run() { register(Cart); } }").facts("Cart.run")).toStrictEqual([
				"call global register (mutable)",
				"unknown call: register(Cart)",
				"read module Cart"
			]);
		});
	});

	describe("unknown-receiver", () => {
		it.each([
			[
				"const f = function () { this.x = 1; };",
				"module > function (line 1)",
				"unknown unknown-receiver: this.x"
			],
			[
				"const f = function () { this.run(); };",
				"module > function (line 1)",
				"unknown unknown-receiver: this.run"
			],
			["const f = function () { return this; };", "module > function (line 1)", "unknown unknown-receiver: this"],
			["function f() { this.x; }", "f", "unknown unknown-receiver: this.x"],
			["this.x;", "module", "unknown unknown-receiver: this.x"],
			["const o = { m() { return this.y; } };", "module > function (line 1)", "unknown unknown-receiver: this.y"]
		])("should report this in %s", (code, label, expected) => {
			expect.assertions(1);

			expect(unknowns(code, label)).toContain(expected);
		});

		it("should report both an unknown receiver and an unknown call for a called member", () => {
			expect.assertions(1);

			expect(unknowns("function f() { this.run(); }", "f")).toStrictEqual([
				"unknown unknown-receiver: this.run",
				"unknown call: this.run"
			]);
		});
	});

	describe("dynamic-member", () => {
		it.each([
			["this[param.key];", ["read property key", "unknown dynamic-member: this[param.key]"]],
			["this[param.key]();", ["read property key", "unknown dynamic-member: this[param.key]"]],
			["this[param.key] = 1;", ["read property key", "unknown dynamic-member: this[param.key]"]],
			["Cart[this.name];", ["read Cart.name", "unknown dynamic-member: Cart[this.name]"]]
		])("should still walk the key of %s", (body, expected) => {
			expect.assertions(1);

			expect(
				analyzeSource(`class Cart {\n\tname = "";\n\trun(param) { ${body} }\n}`).facts("Cart.run")
			).toStrictEqual(expected);
		});
	});

	describe("unanalyzed-declaration", () => {
		it.each([
			["class Inner {}", "class Inner {}"],
			["const Inner = class {};", "class {}"],
			["enum Color { Red }", "enum Color { Red }"],
			["namespace NS { export const a = 1; }", "namespace NS { export const a = 1; }"]
		])("should report %s nested in a method", (body, source) => {
			expect.assertions(1);

			expect(unknowns(`class Cart { run() { ${body} } }`, "Cart.run")).toStrictEqual([
				`unknown unanalyzed-declaration: ${source}`
			]);
		});

		it("should report a module-level enum or namespace, whose body runs with the module", () => {
			expect.assertions(1);

			expect(
				analyzeSource("enum Color { Red }\nnamespace NS { export const a = run(); }").facts("module")
			).toStrictEqual([
				"unknown unanalyzed-declaration: enum Color { Red }",
				"unknown unanalyzed-declaration: namespace NS { export const a = run(); }"
			]);
		});

		it("should report nothing for ambient enums and namespaces", () => {
			expect.assertions(1);

			expect(
				analyzeSource("declare enum Color { Red }\ndeclare namespace NS { const a: number; }").facts("module")
			).toStrictEqual([]);
		});

		it("should walk the expression of an export assignment", () => {
			expect.assertions(1);

			expect(analyzeSource("export = run();").facts("module")).toStrictEqual([
				"call global run (mutable)",
				"unknown call: run()"
			]);
		});

		it("should not walk into a nested class", () => {
			expect.assertions(1);

			expect(
				analyzeSource("class Cart { run() { class Inner { x = fetch(); } } }").facts("Cart.run")
			).toStrictEqual(["unknown unanalyzed-declaration: class Inner { x = fetch(); }"]);
		});
	});

	describe("unsupported-target", () => {
		it("should report an assignment to a call without walking it", () => {
			expect.assertions(1);

			expect(analyzeSource("class Cart { run() { f() = this.x; } }").facts("Cart.run")).toStrictEqual([
				"unknown unsupported-target: f()",
				"read Cart.x (undeclared)"
			]);
		});
	});

	describe("call", () => {
		it("should report JSX as a call", () => {
			expect.assertions(1);

			expect(analyzeTsxFacts("function View() { return <br />; }", "View")).toStrictEqual([
				"unknown call: <br />"
			]);
		});
	});
});
