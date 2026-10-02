import { describe, expect, it } from "vitest";

import { analyzeSource } from "../testing/analyze-source";
import { walkCode } from "./walk-code";

const PRELUDE = `import { helper } from "lib";
let counter = 0;
counter = 1;
let stable = 0;
const limit = 10;
class Other { static total = 0; }
`;

/** The facts of `Cart.run`, a method whose body is `body`, in a module with a few bindings. */
function runFacts(body: string, members = ""): string[] {
	return analyzeSource(
		`${PRELUDE}class Cart {\n\tcount = 0;\n\titems = [];\n\tstatic n = 0;\n${members}\n\trun(param) {\n${body}\n\t}\n}`
	).facts("Cart.run");
}

describe(walkCode, () => {
	describe("members through this", () => {
		it.each([
			["this.count;", ["read Cart.count"]],
			["this.count = 1;", ["write Cart.count"]],
			["this.count += 1;", ["read Cart.count", "write Cart.count"]],
			["this.count ??= 1;", ["read Cart.count", "write Cart.count"]],
			["this.count++;", ["read Cart.count", "write Cart.count"]],
			["--this.count;", ["read Cart.count", "write Cart.count"]],
			["this.items.push;", ["read Cart.items", "read property push"]],
			["this.items.length = 0;", ["read Cart.items", "write property length"]],
			["this.missing;", ["read Cart.missing (undeclared)"]],
			['this["count"];', ["read Cart.count"]],
			["this[`count`];", ["read Cart.count"]],
			["this[0];", ["read Cart.0 (undeclared)"]],
			["this.count!;", ["read Cart.count"]],
			["(this as Cart).count;", ["read Cart.count"]],
			["this?.count;", ["read Cart.count"]]
		])("should record %s as %j", (body, expected) => {
			expect.assertions(1);

			expect(runFacts(body)).toStrictEqual(expected);
		});

		it("should resolve a private name to the #private member, not a string key with the same spelling", () => {
			expect.assertions(2);

			const { model, unit } = analyzeSource(
				'class Cart {\n\t#x = 1;\n\t"#x" = 2;\n\trun() { this.#x; this["#x"]; }\n}'
			);
			const [hash, quoted] = unit("Cart.run").facts.map((fact) =>
				fact.kind === "access" && fact.target.kind === "member" ? fact.target.member : null
			);

			expect(model.declarations.get(hash ?? "")).toMatchObject({ key: { name: "x", private: true } });
			expect(model.declarations.get(quoted ?? "")).toMatchObject({ key: { name: "#x", private: false } });
		});

		it("should resolve a member to its implementation rather than an overload signature", () => {
			expect.assertions(1);

			const { model, unit } = analyzeSource(
				"class Cart {\n\tload(a: number): void;\n\tload(a: unknown) {}\n\trun() { this.load(1); }\n}"
			);
			const [call] = unit("Cart.run").facts;

			expect(
				call?.kind === "access" && call.target.kind === "member"
					? model.declarations.get(call.target.member ?? "")
					: undefined
			).toMatchObject({ signature: false });
		});
	});

	describe("destructuring assignment targets", () => {
		it.each([
			["[this.count, { a: this.items }] = [1, { a: [] }];", ["write Cart.count", "write Cart.items"]],
			["({ count: this.count, ...this.items } = param);", ["write Cart.count", "write Cart.items"]],
			["[this.count = limit] = param;", ["write Cart.count", "read module limit"]],
			["({ [stable]: this.count } = param);", ["read module stable", "write Cart.count"]],
			["[...this.items] = param;", ["write Cart.items"]],
			["[counter] = param;", ["write module counter (mutable)"]]
		])("should record %s as %j", (body, expected) => {
			expect.assertions(1);

			expect(runFacts(body)).toStrictEqual(expected);
		});
	});

	describe("static members", () => {
		it.each([
			["Cart.n;", ["read static Cart.n"]],
			["Cart.n = 1;", ["write static Cart.n"]],
			["Cart.n++;", ["read static Cart.n", "write static Cart.n"]],
			["Other.total;", ["read static Other.total"]],
			["Other.missing = 1;", ["write static Other.missing (undeclared)"]],
			["Cart.count;", ["read static Cart.count (undeclared)"]]
		])("should record %s as %j", (body, expected) => {
			expect.assertions(1);

			expect(runFacts(body)).toStrictEqual(expected);
		});

		it("should resolve this to the class in static code", () => {
			expect.assertions(1);

			const { facts } = analyzeSource(
				"class Cart {\n\tstatic n = 0;\n\tstatic bump() { this.n++; this.count; }\n}"
			);

			expect(facts("Cart.bump")).toStrictEqual([
				"read static Cart.n",
				"write static Cart.n",
				"read static Cart.count (undeclared)"
			]);
		});

		it("should resolve this to the class in a static block and a static field initializer", () => {
			expect.assertions(2);

			const { facts } = analyzeSource(
				"class Cart {\n\tstatic n = 0;\n\tstatic m = this.n;\n\tstatic { this.n = Cart.m; }\n}"
			);

			expect(facts("Cart.m (initializer)")).toStrictEqual(["read static Cart.n", "write static Cart.m"]);
			expect(facts("Cart.static block")).toStrictEqual(["write static Cart.n", "read static Cart.m"]);
		});

		it("should resolve the class's own name inside a const-bound class expression, by either name", () => {
			expect.assertions(1);

			const { facts } = analyzeSource(
				"const Named = class Inner {\n\tstatic z = 1;\n\tgo() { return Inner.z + Named.z; }\n};"
			);

			expect(facts("Named.go")).toStrictEqual(["read static Named.z", "read static Named.z"]);
		});
	});

	describe("field initializers and parameter properties", () => {
		it("should end a field initializer with a write of its own field", () => {
			expect.assertions(2);

			const { facts } = analyzeSource(
				"class Cart {\n\ttotal = 1;\n\tcount = this.total + 1;\n\tstatic n = 0;\n}"
			);

			expect(facts("Cart.count (initializer)")).toStrictEqual(["read Cart.total", "write Cart.count"]);
			expect(facts("Cart.n (initializer)")).toStrictEqual(["write static Cart.n"]);
		});

		it("should not write a field with a computed key", () => {
			expect.assertions(1);

			expect(
				analyzeSource("class Cart { [KEY] = this.total; }").facts("Cart.[computed] (initializer)")
			).toStrictEqual(["read Cart.total (undeclared)"]);
		});

		it("should write an accessor field from its initializer", () => {
			expect.assertions(1);

			expect(analyzeSource("class Cart { accessor size = 1; }").facts("Cart.size (initializer)")).toStrictEqual([
				"write Cart.size"
			]);
		});

		it("should write every parameter property at the start of the constructor, before super()", () => {
			expect.assertions(1);

			const { facts } = analyzeSource(
				"class Cart extends Base {\n\tconstructor(private readonly repo: Repo, plain: number, public name = limit) {\n\t\tsuper();\n\t\tthis.repo.load();\n\t}\n}"
			);

			expect(facts("Cart.constructor")).toStrictEqual([
				"write Cart.repo",
				"write Cart.name",
				"read global limit (mutable)",
				"unknown super: super()",
				"read Cart.repo",
				"call property load",
				"unknown call: this.repo.load"
			]);
		});
	});

	describe("bindings", () => {
		it.each([
			["counter;", ["read module counter (mutable)"]],
			["counter = 2;", ["write module counter (mutable)"]],
			["stable;", ["read module stable"]],
			["limit;", ["read module limit"]],
			["helper;", ["read import helper"]],
			["Other;", ["read module Other"]],
			["window;", ["read global window (mutable)"]],
			["undefined; NaN; Infinity;", ["read global undefined", "read global NaN", "read global Infinity"]],
			["param;", []],
			["const local = 1; let other = local; other = 2; other;", []],
			["for (const item of param) { item; }", []],
			["try {} catch (error) { error; }", []]
		])("should record %s as %j", (body, expected) => {
			expect.assertions(1);

			expect(runFacts(body)).toStrictEqual(expected);
		});

		it("should treat a binding of an enclosing unit as a closure, mutable for parameters and reassigned locals", () => {
			expect.assertions(1);

			const { facts } = analyzeSource(
				"function outer(param) {\n\tconst fixed = 1;\n\tlet changed = 1;\n\tchanged = 2;\n\tlet kept = 1;\n\treturn () => [param, fixed, changed, kept];\n}"
			);

			expect(facts("outer > arrow (line 6)")).toStrictEqual([
				"read closure param (mutable)",
				"read closure fixed",
				"read closure changed (mutable)",
				"read closure kept"
			]);
		});

		it("should record an assignment's target before its value, unlike evaluation order", () => {
			expect.assertions(1);

			expect(runFacts("this.count = stable;")).toStrictEqual(["write Cart.count", "read module stable"]);
		});

		it("should report a closure write", () => {
			expect.assertions(1);

			const { facts } = analyzeSource("function outer() {\n\tlet n = 0;\n\treturn () => { n += 1; };\n}");

			expect(facts("outer > arrow (line 3)")).toStrictEqual([
				"read closure n (mutable)",
				"write closure n (mutable)"
			]);
		});

		it("should report a module let assigned only in a method as mutable", () => {
			expect.assertions(2);

			const { facts, model } = analyzeSource("let cache = null;\nclass Cart { run() { cache = 1; } }");

			expect(facts("Cart.run")).toStrictEqual(["write module cache (mutable)"]);
			expect([...model.declarations.values()][0]).toMatchObject({ reassigned: true });
		});

		it("should never report an import as mutable, even a namespace whose members are assigned", () => {
			expect.assertions(1);

			const { facts } = analyzeSource('import * as ns from "lib";\nfunction f() { ns.value = 1; }');

			expect(facts("f")).toStrictEqual(["read import ns", "write property value"]);
		});
	});

	describe("properties of other objects", () => {
		it.each([
			["param.x;", ["read property x"]],
			["param.x = 1;", ["write property x"]],
			["param.x += 1;", ["read property x", "write property x"]],
			["param[stable] = 1;", ["read module stable", "write property [?]"]],
			['param["x"];', ["read property x"]],
			["window.location.href;", ["read global window (mutable)", "read property location", "read property href"]],
			["(0, param).x = 1;", ["write property x"]]
		])("should record %s as %j", (body, expected) => {
			expect.assertions(1);

			expect(runFacts(body)).toStrictEqual(expected);
		});
	});

	describe("other expressions", () => {
		it.each([
			[
				"const copy = { ...this.items, [stable]: limit };",
				["read Cart.items", "read module stable", "read module limit"]
			],
			["[...this.items];", ["read Cart.items"]],
			["`${this.count}`;", ["read Cart.count"]],
			["this.count ? stable : limit;", ["read Cart.count", "read module stable", "read module limit"]],
			["typeof counter;", ["read module counter (mutable)"]],
			["new.target;", []],
			["param as Cart;", []]
		])("should record %s as %j", (body, expected) => {
			expect.assertions(1);

			expect(runFacts(body)).toStrictEqual(expected);
		});
	});
});
