import { describe, expect, it } from "vitest";

import { analyzeSource } from "../testing/analyze-source";
import { describeUnit, unitLabels } from "../testing/extraction-lookup";
import { buildClassUnits } from "./build-class-units";

const SHOP = `import { Dec } from "lib";
const KEY = "k";
@Dec()
class Shop extends Base {
	declare declared: number;
	plain: string;
	count = 0;
	static n = 1;
	accessor size = 2;
	handler = () => this.count;
	[KEY] = 3;
	static { Shop.n = 2; }
	constructor(private readonly repo: Repo) { super(); }
	load(a: number): void;
	load(a: unknown) {}
	abstract run(): void;
	get total() { return this.count; }
	set total(value) { this.count = value; }
	static make() { return this.n; }
}`;

describe(buildClassUnits, () => {
	it("should build one unit per member with code, in member order, after the definition unit", () => {
		expect.assertions(1);

		expect(unitLabels(analyzeSource(SHOP).model)).toStrictEqual([
			"module",
			"Shop (definition)",
			"Shop.count (initializer)",
			"Shop.n (initializer)",
			"Shop.size (initializer)",
			"Shop.handler (initializer)",
			"Shop.handler (initializer) > arrow (line 10)",
			"Shop.[computed] (initializer)",
			"Shop.static block",
			"Shop.constructor",
			"Shop.load",
			"Shop.total (get)",
			"Shop.total (set)",
			"Shop.make"
		]);
	});

	it.each([
		["Shop (definition)", "class-definition | class-definition | this: none | in module | of Shop"],
		[
			"Shop.count (initializer)",
			"field-initializer | instance-construction | this: instance Shop | in module | of Shop.count"
		],
		["Shop.n (initializer)", "field-initializer | class-definition | this: class Shop | in module | of Shop.n"],
		[
			"Shop.size (initializer)",
			"field-initializer | instance-construction | this: instance Shop | in module | of Shop.size"
		],
		[
			"Shop.handler (initializer) > arrow (line 10)",
			"function | invocation | this: instance Shop | in Shop.handler (initializer) | of Shop.handler"
		],
		["Shop.static block", "static-block | class-definition | this: class Shop | in module | of Shop.static block"],
		[
			"Shop.constructor",
			"constructor | instance-construction | this: instance Shop | in module | of Shop.constructor"
		],
		["Shop.load", "method | invocation | this: instance Shop | in module | of Shop.load"],
		["Shop.total (get)", "getter | invocation | this: instance Shop | in module | of Shop.total"],
		["Shop.total (set)", "setter | invocation | this: instance Shop | in module | of Shop.total"],
		["Shop.make", "method | invocation | this: class Shop | in module | of Shop.make"]
	])("should shape %s as %s", (label, expected) => {
		expect.assertions(1);

		const { model, unit } = analyzeSource(SHOP);

		expect(describeUnit(model, unit(label))).toBe(expected);
	});

	it("should link an overloaded method's unit to its implementation, not a signature", () => {
		expect.assertions(1);

		const { model, unit } = analyzeSource(SHOP);
		const owner = model.declarations.get(unit("Shop.load").declaration ?? "");

		expect(owner).toMatchObject({ kind: "method", signature: false });
	});

	describe("code roots", () => {
		it.each([
			["Shop (definition)", ["@Dec()", "Base", "KEY"]],
			["Shop.count (initializer)", ["0"]],
			["Shop.handler (initializer)", ["() => this.count"]],
			["Shop.static block", ["static { Shop.n = 2; }"]],
			["Shop.make", ["() { return this.n; }"]]
		])("should root %s at %j", (label, expected) => {
			expect.assertions(1);

			const { unit } = analyzeSource(SHOP);

			expect(unit(label).code.map((root) => SHOP.slice(...root.range))).toStrictEqual(expected);
		});

		it("should add function literals and module classes to the boundaries, but not member bodies, which the class covers", () => {
			expect.assertions(1);

			const { model } = analyzeSource(SHOP);

			expect(
				[...model.boundaries].map((node) => node.type).toSorted((left, right) => left.localeCompare(right))
			).toStrictEqual(["ArrowFunctionExpression", "ClassDeclaration"]);
		});
	});

	describe("the definition unit", () => {
		it("should collect decorators of the class, its members and constructor parameters, the heritage and computed keys", () => {
			expect.assertions(1);

			const code = `@A() class Shop extends B {
	@C() field = 1;
	@D() [E] = 2;
	constructor(@F() private readonly f: string) {}
	@G() method() {}
}`;
			const { unit } = analyzeSource(code);

			expect(unit("Shop (definition)").code.map((root) => code.slice(...root.range))).toStrictEqual([
				"@A()",
				"B",
				"@C()",
				"@D()",
				"E",
				"@F()",
				"@G()"
			]);
		});

		it("should not exist for a class without decorators, heritage or computed keys", () => {
			expect.assertions(1);

			expect(unitLabels(analyzeSource("class Shop { count = 0; static {} load() {} }").model)).toStrictEqual([
				"module",
				"Shop.count (initializer)",
				"Shop.static block",
				"Shop.load"
			]);
		});

		it("should share the module's receiver, so this in a computed key is an unknown receiver", () => {
			expect.assertions(1);

			expect(analyzeSource("class Shop { [this.key] = 1; }").facts("Shop (definition)")).toStrictEqual([
				"unknown unknown-receiver: this.key"
			]);
		});
	});

	describe("members without code", () => {
		it("should build no unit for fields without initializers, declared fields, signatures or index signatures", () => {
			expect.assertions(1);

			const code =
				"abstract class Shop {\n\t[key: string]: unknown;\n\ta: number;\n\tdeclare b: number;\n\tstatic accessor c;\n\tabstract d(): void;\n\te(): void;\n\tprotected abstract f: number;\n}";

			expect(unitLabels(analyzeSource(code).model)).toStrictEqual(["module"]);
		});
	});
});
