import { describe, expect, it } from "vitest";

import { analyzeSource } from "../testing/analyze-source";
import { declarationOf, describeDeclaration } from "../testing/extraction-lookup";
import { collectModuleDeclarations } from "./collect-module-declarations";

/** Every declaration of `code`, described one per line, in id order. */
function declarations(code: string): string[] {
	return [...analyzeSource(code).model.declarations.values()].map((declaration) => describeDeclaration(declaration));
}

describe(collectModuleDeclarations, () => {
	describe("imports", () => {
		it.each([
			['import def from "lib";', 'import def = default from "lib"'],
			['import { a } from "lib";', 'import a = a from "lib"'],
			['import { b as c } from "lib";', 'import c = b from "lib"'],
			['import { "odd name" as odd } from "lib";', 'import odd = odd name from "lib"'],
			['import * as ns from "lib";', 'import ns = * from "lib"'],
			['import type { T } from "lib";', 'import T = T from "lib" (type)'],
			['import { type T } from "lib";', 'import T = T from "lib" (type)'],
			['import type Def from "lib";', 'import Def = default from "lib" (type)']
		])("should declare %s as %s", (code, expected) => {
			expect.assertions(1);

			expect(declarations(code)).toStrictEqual([expected]);
		});

		it("should declare each specifier of one import separately", () => {
			expect.assertions(1);

			expect(declarations('import def, { a, type T } from "lib";')).toStrictEqual([
				'import def = default from "lib"',
				'import a = a from "lib"',
				'import T = T from "lib" (type)'
			]);
		});

		it("should declare nothing for a side-effect import", () => {
			expect.assertions(1);

			expect(declarations('import "polyfill";')).toStrictEqual([]);
		});
	});

	describe("variables", () => {
		it.each([
			["let x;", "variable let x = none"],
			["var x = 1;", "variable var x = other"],
			["const x = () => 1;", "variable const x = function"],
			["const x = function () {};", "variable const x = function"],
			["const x = (async () => 1) as unknown;", "variable const x = function"],
			["const x = make();", "variable const x = other"],
			["const x = class {};", "variable const x = other"],
			["let x = 1; x = 2;", "variable let x = other (reassigned)"],
			["let x = 1; x++;", "variable let x = other (reassigned)"],
			["let x = () => 1; function f() { x = null; }", "variable let x = function (reassigned)"],
			["export const x = 1;", "variable const x = other (exported)"]
		])("should declare %s as %s", (code, expected) => {
			expect.assertions(1);

			expect(declarations(code).filter((line) => line.startsWith("variable"))).toStrictEqual([expected]);
		});

		it("should declare every binding of a destructuring declarator, whose value is other", () => {
			expect.assertions(1);

			expect(declarations("const [a, { b, ...rest }] = source;")).toStrictEqual([
				"variable const a = other",
				"variable const b = other",
				"variable const rest = other"
			]);
		});

		it("should declare a const bound to a class expression as both a variable and a class", () => {
			expect.assertions(1);

			expect(declarations("const Cart = class { total = 0; };")).toStrictEqual([
				"variable const Cart = other",
				"class Cart",
				'field Cart.total ["total"] public = other'
			]);
		});
	});

	describe("functions and classes", () => {
		it.each([
			["function f() {}", "function f"],
			["async function* f() {}", "function f"],
			["function f() {} f = null;", "function f (reassigned)"],
			["export function f() {}", "function f (exported)"],
			["export default function f() {}", "function f (exported)"],
			["export default function () {}", "function default (exported)"],
			["class Cart {}", "class Cart"],
			["export class Cart {}", "class Cart (exported)"],
			["export default class Cart {}", "class Cart (exported)"],
			["export default class {}", "class default (exported)"]
		])("should declare %s as %s", (code, expected) => {
			expect.assertions(1);

			expect(declarations(code)).toStrictEqual([expected]);
		});

		it("should give an anonymous default export no name", () => {
			expect.assertions(2);

			const { model } = analyzeSource("export default function () {}\n");

			expect(declarationOf(model, "default").name).toBeNull();
			expect(declarationOf(model, "default").kind).toBe("function");
		});

		it("should give declarations ids in source order", () => {
			expect.assertions(1);

			const { model } = analyzeSource(
				'import { a } from "lib";\nconst b = 1;\nfunction c() {}\nclass D { e = 1; }'
			);

			expect(
				[...model.declarations.entries()].map(([id, declaration]) => `${id} ${declaration.qualifiedName}`)
			).toStrictEqual(["d0 a", "d1 b", "d2 c", "d3 D", "d4 D.e"]);
		});
	});

	describe("local export lists", () => {
		it.each([
			["let x = 1; export { x };", "variable let x = other (exported)"],
			["let x = 1; export { x as y };", "variable let x = other (exported)"],
			["function f() {} export { f };", "function f (exported)"],
			["class Cart {} export { Cart };", "class Cart (exported)"],
			["class Cart {} export default Cart;", "class Cart (exported)"],
			["function f() {} export default f;", "function f (exported)"]
		])("should mark %s as %s", (code, expected) => {
			expect.assertions(1);

			expect(declarations(code)).toStrictEqual([expected]);
		});

		it("should mark both the variable and the class of an exported const-bound class", () => {
			expect.assertions(1);

			expect(declarations("const Cart = class {}; export { Cart };")).toStrictEqual([
				"variable const Cart = other (exported)",
				"class Cart (exported)"
			]);
		});

		it("should not mark an import re-exported by name", () => {
			expect.assertions(1);

			expect(declarations('import { a } from "lib"; export { a };')).toStrictEqual(['import a = a from "lib"']);
		});

		it("should declare nothing for a re-export from another module", () => {
			expect.assertions(1);

			expect(declarations('export { a } from "lib"; export * from "other";')).toStrictEqual([]);
		});
	});

	describe("unmodelled statements", () => {
		it("should declare nothing for enums, namespaces, types and interfaces", () => {
			expect.assertions(1);

			expect(
				declarations(
					"enum Color { Red }\nnamespace NS { export const a = 1; }\ntype T = 1;\ninterface I { a: 1 }"
				)
			).toStrictEqual([]);
		});

		it("should declare nothing for a class nested in a function", () => {
			expect.assertions(1);

			expect(declarations("function f() { class Inner {} }")).toStrictEqual(["function f"]);
		});
	});
});
