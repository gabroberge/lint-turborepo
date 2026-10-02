import { describe, expect, it } from "vitest";

import { analyzeSource } from "../testing/analyze-source";
import { describeDeclaration } from "../testing/extraction-lookup";
import { collectClassMembers } from "./collect-class-members";

/** The members of the module's only class, described one per line, in source order. */
function members(body: string): string[] {
	return [...analyzeSource(`abstract class Shop extends Base {\n${body}\n}`).model.declarations.values()]
		.filter((declaration) => declaration.kind !== "class")
		.map((declaration) => describeDeclaration(declaration));
}

describe(collectClassMembers, () => {
	describe("member kinds", () => {
		it.each([
			["count = 0;", 'field Shop.count ["count"] public = other'],
			["count: number;", 'field Shop.count ["count"] public'],
			["declare count: number;", 'field Shop.count ["count"] public'],
			["count?: number;", 'field Shop.count ["count"] public'],
			["handler = () => 1;", 'field Shop.handler ["handler"] public = function'],
			["handler = function () {};", 'field Shop.handler ["handler"] public = function'],
			["value = make();", 'field Shop.value ["value"] public = other'],
			["accessor size = 1;", 'accessor-field Shop.size ["size"] public = other'],
			["static accessor size;", 'accessor-field Shop.size ["size"] public static'],
			["protected abstract size: number;", 'field Shop.size ["size"] protected'],
			["[key: string]: unknown;", "index-signature Shop.[index] [computed] public"],
			["static { init(); }", "static-block Shop.static block [computed] public static"],
			["constructor() { super(); }", 'constructor Shop.constructor ["constructor"] public'],
			["load() {}", 'method Shop.load ["load"] public'],
			["async *stream() {}", 'method Shop.stream ["stream"] public'],
			["abstract run(): void;", 'method Shop.run ["run"] public signature'],
			["get total() { return 1; }", 'getter Shop.total ["total"] public'],
			["set total(value) {}", 'setter Shop.total ["total"] public'],
			["static make() {}", 'method Shop.make ["make"] public static'],
			["static n = 0;", 'field Shop.n ["n"] public static = other']
		])("should declare %s as %s", (body, expected) => {
			expect.assertions(1);

			expect(members(body)).toStrictEqual([expected]);
		});

		it("should declare each overload signature and the implementation", () => {
			expect.assertions(1);

			expect(members("load(a: number): void;\nload(a: string): void;\nload(a: unknown) {}")).toStrictEqual([
				'method Shop.load ["load"] public signature',
				'method Shop.load ["load"] public signature',
				'method Shop.load ["load"] public'
			]);
		});
	});

	describe("visibility", () => {
		it.each([
			["a = 1;", "public"],
			["public a = 1;", "public"],
			["protected a = 1;", "protected"],
			["private a = 1;", "private"],
			["#a = 1;", "private"],
			["#a() {}", "private"],
			["private static a() {}", "private"]
		])("should give %s the visibility %s", (body, visibility) => {
			expect.assertions(1);

			expect(members(body)[0]).toContain(` ${visibility}`);
		});
	});

	describe("keys", () => {
		it.each([
			["#x = 1;", "field Shop.#x [#x] private = other"],
			['"#x" = 1;', 'field Shop.#x ["#x"] public = other'],
			['"quoted name" = 1;', 'field Shop.quoted name ["quoted name"] public = other'],
			['["literal"] = 1;', 'field Shop.literal ["literal"] public = other'],
			["[3] = 1;", 'field Shop.3 ["3"] public = other'],
			["0x10 = 1;", 'field Shop.16 ["16"] public = other'],
			["[KEY] = 1;", "field Shop.[computed] [computed] public = other"],
			['["a" + "b"]() {}', "method Shop.[computed] [computed] public"],
			["[Symbol.iterator]() {}", "method Shop.[computed] [computed] public"]
		])("should key %s as in %s", (body, expected) => {
			expect.assertions(1);

			expect(members(body)).toStrictEqual([expected]);
		});

		it("should keep a #private name and a string key with the same spelling distinct, though both are labelled #x", () => {
			expect.assertions(3);

			const { model } = analyzeSource('class Shop {\n\t#x = 1;\n\t"#x" = 2;\n}');
			const [hash, quoted] = [...model.declarations.values()].filter(
				(declaration) => declaration.kind === "field"
			);

			expect(hash?.qualifiedName).toBe(quoted?.qualifiedName);
			expect(hash).toMatchObject({ key: { name: "x", private: true }, name: "x" });
			expect(quoted).toMatchObject({ key: { name: "#x", private: false }, name: "#x" });
		});

		it("should give a computed key and a static block a null key and name", () => {
			expect.assertions(1);

			const { model } = analyzeSource("class Shop {\n\t[KEY] = 1;\n\tstatic {}\n}");

			expect(
				[...model.declarations.values()]
					.filter((declaration) => declaration.kind !== "class")
					.map((declaration) => ("key" in declaration ? [declaration.key, declaration.name] : []))
			).toStrictEqual([
				[null, null],
				[null, null]
			]);
		});
	});

	describe("parameter properties", () => {
		it("should declare each parameter property after its constructor, skipping plain parameters", () => {
			expect.assertions(1);

			expect(
				members(
					'constructor(private readonly repo: Repo, public name = "x", plain: number, protected readonly z?: number, readonly r: R) { super(); }'
				)
			).toStrictEqual([
				'constructor Shop.constructor ["constructor"] public',
				'parameter-property Shop.repo ["repo"] private = other',
				'parameter-property Shop.name ["name"] public = other',
				'parameter-property Shop.z ["z"] protected = other',
				'parameter-property Shop.r ["r"] public = other'
			]);
		});

		it("should attach every member to its class", () => {
			expect.assertions(1);

			const { model } = analyzeSource("class A { a = 1; }\nclass B { constructor(private b: B) {} }");
			const owners = [...model.declarations.values()].map((declaration) =>
				"class" in declaration ? `${declaration.qualifiedName} in ${declaration.class}` : declaration.id
			);

			expect(owners).toStrictEqual(["d0", "A.a in d0", "d2", "B.constructor in d2", "B.b in d2"]);
		});
	});

	describe("reassigned members", () => {
		it.each([
			["h = () => 1;\nm() { this.h = null; }", 'field Shop.h ["h"] public = function (reassigned)'],
			["h = () => 1;\nm() { this.h ||= null; }", 'field Shop.h ["h"] public = function (reassigned)'],
			["h = 0;\nm() { this.h++; }", 'field Shop.h ["h"] public = other (reassigned)'],
			["h = () => 1;\nm(p) { [this.h] = p; }", 'field Shop.h ["h"] public = function (reassigned)'],
			["h = () => 1;\nm(p) { ({ a: this.h } = p); }", 'field Shop.h ["h"] public = function (reassigned)'],
			["h = () => 1;\nm(p) { for (this.h of p) {} }", 'field Shop.h ["h"] public = function (reassigned)'],
			["#h = () => 1;\nm() { this.#h = null; }", "field Shop.#h [#h] private = function (reassigned)"],
			[
				"static h = () => 1;\nstatic m() { Shop.h = null; }",
				'field Shop.h ["h"] public static = function (reassigned)'
			],
			[
				"static h = () => 1;\nstatic { this.h = null; }",
				'field Shop.h ["h"] public static = function (reassigned)'
			],
			[
				"accessor h = () => 1;\nm() { this.h = null; }",
				'accessor-field Shop.h ["h"] public = function (reassigned)'
			],
			[
				"h() {}\nconstructor() { super(); this.h = this.h.bind(this); }",
				'method Shop.h ["h"] public (reassigned)'
			]
		])("should mark the first member of %s as %s", (body, expected) => {
			expect.assertions(1);

			expect(members(body)[0]).toBe(expected);
		});

		it.each([
			["h = () => 1;\nm() { this.h(); }", 'field Shop.h ["h"] public = function'],
			["static h = () => 1;\nm() { this.h = null; }", 'field Shop.h ["h"] public static = function'],
			["h = () => 1;\nstatic m() { this.h = null; }", 'field Shop.h ["h"] public = function'],
			["get h() { return 1; }\nm() { this.h = 1; }", 'getter Shop.h ["h"] public'],
			["h = () => 1;\nm(other) { other.h = null; }", 'field Shop.h ["h"] public = function']
		])("should not mark the first member of %s as reassigned", (body, expected) => {
			expect.assertions(1);

			expect(members(body)[0]).toBe(expected);
		});

		it("should mark a static member assigned through the class name from module code", () => {
			expect.assertions(1);

			const { model } = analyzeSource("class Shop { static h = () => 1; }\nShop.h = null;");

			expect([...model.declarations.values()].map((declaration) => describeDeclaration(declaration))).toContain(
				'field Shop.h ["h"] public static = function (reassigned)'
			);
		});
	});
});
