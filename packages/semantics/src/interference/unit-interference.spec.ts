import { describe, expect, it } from "vitest";

import type { AnalyzeOptions } from "../index";
import { analyzeSource } from "../testing/analyze-source";
import { QUERY_ANGULAR_ASSUMPTIONS, QUERY_ANGULAR_COMPONENT, QUERY_NEST_SERVICE } from "../testing/query-fixtures";
import { queryInterference } from "../testing/query-interference";
import { queryMemberUnit } from "../testing/query-member-unit";
import { unitInterference } from "./unit-interference";

interface InterferenceCase {
	code: string[];
	expected: "definite" | "none" | "possible";
	first: string;
	name: string;
	options?: AnalyzeOptions;
	second: string;
}

const LIB_IMPORT = 'import { first, LIMIT, log, name, second, Token } from "./lib";';
const ANGULAR_IMPORT = 'import { computed, inject, signal } from "@angular/core";';
const ANGULAR = { assumptions: QUERY_ANGULAR_ASSUMPTIONS };

/** The scenarios of the old class analyzer's conflict tests, translated to units. */
const CASES: InterferenceCase[] = [
	{
		code: ["class A {", "\ta = 1;", "\tb = this.a + 1;", "}"],
		expected: "definite",
		first: "A.a (initializer)",
		name: "an eager read of an earlier field (the definition write)",
		second: "A.b (initializer)"
	},
	{
		code: ["class A {", "\tb = this.a;", "\ta = 1;", "}"],
		expected: "definite",
		first: "A.b (initializer)",
		name: "a forward reference to a later field",
		second: "A.a (initializer)"
	},
	{
		code: ["class A {", "\tx = 1;", "\ty = this.compute();", "\tcompute(): number { return this.x; }", "}"],
		expected: "definite",
		first: "A.x (initializer)",
		name: "a read through a method call",
		second: "A.y (initializer)"
	},
	{
		code: [
			"class A {",
			"\tx = 1;",
			"\ty = this.outer();",
			"\touter(): number { return this.inner(); }",
			"\tinner(): number { return this.x; }",
			"}"
		],
		expected: "definite",
		first: "A.x (initializer)",
		name: "a read through two methods",
		second: "A.y (initializer)"
	},
	{
		code: [
			"class A {",
			"\tx = 1;",
			"\ty = this.even(4);",
			"\teven(n: number): boolean { return n === 0 || this.odd(n - 1); }",
			"\todd(n: number): boolean { return n !== 0 && this.even(n - 1) && this.x > 0; }",
			"}"
		],
		expected: "definite",
		first: "A.x (initializer)",
		name: "a read through mutually recursive methods",
		second: "A.y (initializer)"
	},
	{
		code: ["class A {", "\tx = 1;", "\ty = this.total;", "\tget total(): number { return this.x; }", "}"],
		expected: "definite",
		first: "A.x (initializer)",
		name: "a read through a getter",
		second: "A.y (initializer)"
	},
	{
		code: [
			"class A {",
			"\tx = 1;",
			"\ty = (this.total = 2);",
			"\tget total(): number { return this.x; }",
			"\tset total(next: number) { this.x = next; }",
			"}"
		],
		expected: "definite",
		first: "A.x (initializer)",
		name: "a write through the setter of an accessor pair",
		second: "A.y (initializer)"
	},
	{
		code: [ANGULAR_IMPORT, "class A {", "\tx = signal(1);", "\tdoubled = computed(() => this.x() * 2);", "}"],
		expected: "none",
		first: "A.x (initializer)",
		name: "a read deferred by a signal factory",
		options: ANGULAR,
		second: "A.doubled (initializer)"
	},
	{
		code: [
			"function derive<T>(fn: () => T): T { return fn(); }",
			"class A {",
			"\tx = 1;",
			"\tdoubled = derive(() => this.x * 2);",
			"}"
		],
		expected: "definite",
		first: "A.x (initializer)",
		name: "a read inside a callback of a local function named like a factory",
		second: "A.doubled (initializer)"
	},
	{
		code: [
			ANGULAR_IMPORT,
			"class A {",
			"\tcount = signal(0);",
			"\tdoubled = computed(() => this.count() * 2);",
			"\tquadrupled = this.doubled() * 2;",
			"}"
		],
		expected: "definite",
		first: "A.doubled (initializer)",
		name: "an eager call of a signal-like field and its definition",
		options: ANGULAR,
		second: "A.quadrupled (initializer)"
	},
	{
		code: ["class A {", "\tx = 1;", "\tread = (): number => this.x;", "}"],
		expected: "none",
		first: "A.x (initializer)",
		name: "a read deferred by an arrow-function field",
		second: "A.read (initializer)"
	},
	{
		code: [LIB_IMPORT, "class A {", "\ta = first();", "\tb = second();", "}"],
		expected: "possible",
		first: "A.a (initializer)",
		name: "two unknown calls",
		second: "A.b (initializer)"
	},
	{
		code: [LIB_IMPORT, "class A {", "\ta = log();", "\tb = 1;", "}"],
		expected: "none",
		first: "A.a (initializer)",
		name: "an unknown call and a literal",
		second: "A.b (initializer)"
	},
	{
		code: [LIB_IMPORT, "class A {", "\ta = log();", "\tb = LIMIT;", "}"],
		expected: "none",
		first: "A.a (initializer)",
		name: "an unknown call and an imported binding",
		second: "A.b (initializer)"
	},
	{
		code: [LIB_IMPORT, "const SIZE = 3;", "class A {", "\ta = log();", "\tb = SIZE;", "}"],
		expected: "none",
		first: "A.a (initializer)",
		name: "an unknown call and a module const",
		second: "A.b (initializer)"
	},
	{
		code: ["function f(): number { return 1; }", "class A {", "\ta = ((f = (): number => 2), 0);", "\tb = f;", "}"],
		expected: "definite",
		first: "A.a (initializer)",
		name: "a reassigned function declaration and a read of it",
		second: "A.b (initializer)"
	},
	{
		code: [
			LIB_IMPORT,
			"let counter = 0;",
			"export function bump(): void { counter += 1; }",
			"class A {",
			"\ta = log();",
			"\tb = counter;",
			"}"
		],
		expected: "possible",
		first: "A.a (initializer)",
		name: "an unknown call and a reassigned module let",
		second: "A.b (initializer)"
	},
	{
		code: [LIB_IMPORT, "let counter = 0;", "class A {", "\ta = log();", "\tb = counter;", "}"],
		expected: "none",
		first: "A.a (initializer)",
		name: "an unknown call and a module let that is never reassigned",
		second: "A.b (initializer)"
	},
	{
		code: [LIB_IMPORT, "class A {", "\ta = log();", "\tb = someGlobal;", "}"],
		expected: "possible",
		first: "A.a (initializer)",
		name: "an unknown call and a global",
		second: "A.b (initializer)"
	},
	{
		code: [LIB_IMPORT, "class A {", "\tother = { value: 1 };", "\ta = log();", "\tb = this.other.value;", "}"],
		expected: "possible",
		first: "A.a (initializer)",
		name: "an unknown call and a property of another object",
		second: "A.b (initializer)"
	},
	{
		code: [LIB_IMPORT, "class A {", "\ta = LIMIT;", "\tb = this.other.value;", "\tother = { value: 1 };", "}"],
		expected: "none",
		first: "A.a (initializer)",
		name: "two external reads",
		second: "A.b (initializer)"
	},
	{
		code: ["class A {", "\tz = 1;", '\tb = eval("this.z");', "}"],
		expected: "possible",
		first: "A.z (initializer)",
		name: "a direct eval and a pure literal",
		second: "A.b (initializer)"
	},
	{
		code: ["const evaluate = eval;", "class A {", "\tz = 1;", '\tb = evaluate("1");', "}"],
		expected: "none",
		first: "A.z (initializer)",
		name: "an indirect eval and a pure literal",
		second: "A.b (initializer)"
	},
	{
		code: [LIB_IMPORT, "class A {", "\ta = log(this);", "\tb = 1;", "}"],
		expected: "possible",
		first: "A.a (initializer)",
		name: "an escaping this and a literal",
		second: "A.b (initializer)"
	},
	{
		code: [LIB_IMPORT, "class A {", "\ta = this[name];", "\tb = 1;", "}"],
		expected: "possible",
		first: "A.a (initializer)",
		name: "a dynamic member access and a literal",
		second: "A.b (initializer)"
	},
	{
		code: ["class A extends Object {", "\ta = this.fromBase;", "\tb = 1;", "}"],
		expected: "possible",
		first: "A.a (initializer)",
		name: "an inherited member read and a literal",
		second: "A.b (initializer)"
	},
	{
		code: ["class A extends Object {", "\ta = this.fromBase();", "\tb = 1;", "}"],
		expected: "possible",
		first: "A.a (initializer)",
		name: "an inherited method call and a literal",
		second: "A.b (initializer)"
	},
	{
		code: ["class A {", "\ta = this.added;", "\tb = 1;", "}"],
		expected: "none",
		first: "A.a (initializer)",
		name: "an undeclared member read without a superclass and a literal",
		second: "A.b (initializer)"
	},
	{
		code: ["class A {", "\ta = super.toString();", "\tb = 1;", "}"],
		expected: "possible",
		first: "A.a (initializer)",
		name: "a super access and a literal",
		second: "A.b (initializer)"
	},
	{
		code: [
			"class A {",
			"\ta = this.init();",
			"\tb = this.y;",
			"\ty = 0;",
			"\tinit(): number {",
			"\t\tthis.y = 1;",
			"\t\treturn 1;",
			"\t}",
			"}"
		],
		expected: "definite",
		first: "A.a (initializer)",
		name: "a method write and a read of the same field",
		second: "A.b (initializer)"
	},
	{
		code: [
			"interface Svc { value: number }",
			"class A {",
			"\ta = this.svc;",
			"\tb = 1;",
			"\tconstructor(private readonly svc: Svc) {}",
			"}"
		],
		expected: "none",
		first: "A.a (initializer)",
		name: "a parameter property read and a literal",
		second: "A.b (initializer)"
	},
	{
		code: [
			"interface Svc { value: number }",
			"class A {",
			"\ta = this.svc;",
			"\tconstructor(private readonly svc: Svc) {}",
			"}"
		],
		expected: "definite",
		first: "A.a (initializer)",
		name: "a parameter property read and the constructor defining it",
		second: "A.constructor"
	},
	{
		code: ["class A {", "\tconstructor(private p: number) {}", "\tb = (this.p = 2);", "\ta = this.p;", "}"],
		expected: "definite",
		first: "A.b (initializer)",
		name: "a parameter property written and then read",
		second: "A.a (initializer)"
	},
	{
		code: ["class A {", "\tconstructor(private p = 1) {}", "\tb = (this.p = 2);", "\ta = this.p;", "}"],
		expected: "definite",
		first: "A.b (initializer)",
		name: "a defaulted parameter property written and then read",
		second: "A.a (initializer)"
	},
	{
		code: [ANGULAR_IMPORT, LIB_IMPORT, "class A {", "\tsvc = inject(Token);", "\ta = log();", "}"],
		expected: "none",
		first: "A.svc (initializer)",
		name: "a factory call and an unknown call",
		options: ANGULAR,
		second: "A.a (initializer)"
	},
	{
		code: [
			LIB_IMPORT,
			"class A {",
			"\tstatic a = 1;",
			"\tstatic {",
			"\t\tlog();",
			"\t}",
			"\tstatic b = log();",
			"}"
		],
		expected: "possible",
		first: "A.static block",
		name: "a static block and a static initializer with unknown calls",
		second: "A.b (initializer)"
	},
	{
		code: ["class A {", "\tstatic a = new this();", "\tstatic b = 1;", "}"],
		expected: "possible",
		first: "A.a (initializer)",
		name: "a static self instantiation and a literal",
		second: "A.b (initializer)"
	},
	{
		code: ["class Config {", "\tstatic base = 1;", "\tstatic derived = Config.base + 1;", "}"],
		expected: "definite",
		first: "Config.base (initializer)",
		name: "a static read through the class name",
		second: "Config.derived (initializer)"
	},
	{
		code: ["class A {", "\ty = 0;", "\ta = (this.y = 2);", "\tb = (this.y = 3);", "}"],
		expected: "definite",
		first: "A.a (initializer)",
		name: "two writes of another field",
		second: "A.b (initializer)"
	},
	{
		code: ["class A {", "\ty = 0;", "\ta = this.y + 1;", "\tb = this.y + 2;", "}"],
		expected: "none",
		first: "A.a (initializer)",
		name: "two reads of one field",
		second: "A.b (initializer)"
	},
	{
		code: ["class A {", "\ta = this.m();", "\tb = this.m;", "\tm(): number { return 1; }", "}"],
		expected: "none",
		first: "A.a (initializer)",
		name: "a call and a read of one method",
		second: "A.b (initializer)"
	},
	{
		code: ["class A {", "\tm = () => 1;", "\ta = this.m();", "\tb = this.m();", "}"],
		expected: "none",
		first: "A.a (initializer)",
		name: "two calls of one field",
		second: "A.b (initializer)"
	}
];

describe(unitInterference, () => {
	it.each(CASES)("should find $expected interference for $name", ({ code, expected, first, options, second }) => {
		expect.assertions(2);

		const result = queryInterference(code.join("\n"), first, second, options);

		expect(result.kind).toBe(expected);
		expect(result.reversedKind).toBe(expected);
	});

	describe("when a field is called before a later initializer defines it", () => {
		it("should find the call against the later field's definition", () => {
			expect.assertions(2);

			const code = ["class A {", "\ta = this.m();", "\tm = () => 1;", "}"].join("\n");
			const result = queryInterference(code, "A.a (initializer)", "A.m (initializer)");

			expect(result.kind).toBe("definite");
			expect(result.evidence).toStrictEqual(["same-location: call A.m / write A.m"]);
		});

		it("should find the call against a write in another initializer", () => {
			expect.assertions(2);

			const code = ["class A {", "\tm = () => 1;", "\ta = this.m();", "\tb = (this.m = () => 2);", "}"].join(
				"\n"
			);
			const result = queryInterference(code, "A.a (initializer)", "A.b (initializer)");

			expect(result.kind).toBe("definite");
			expect(result.evidence).toStrictEqual(["same-location: call A.m / write A.m"]);
		});

		it("should find a call through a method against a write in an initializer", () => {
			expect.assertions(2);

			const code = [
				"class A {",
				"\tm = () => 1;",
				"\ta = this.run();",
				"\tb = (this.m = () => 2);",
				"\trun(): number { return this.m(); }",
				"}"
			].join("\n");
			const result = queryInterference(code, "A.a (initializer)", "A.b (initializer)");

			expect(result.kind).toBe("definite");
			expect(result.evidence).toStrictEqual([
				"same-location: call A.m (A.a (initializer) -calls-> A.run) / write A.m"
			]);
		});
	});

	describe("when keys look alike", () => {
		it("should keep a #private key apart from a string key with the same spelling", () => {
			expect.assertions(2);

			const code = ["class A {", "\t#x = 1;", '\t"#x" = 2;', "\ty = this.#x;", '\tz = this["#x"];', "}"].join(
				"\n"
			);
			const privateX = queryInterference(
				code,
				(model) => queryMemberUnit(model, { class: "A", name: "x", private: true }),
				"A.z (initializer)"
			);
			const stringX = queryInterference(
				code,
				(model) => queryMemberUnit(model, { class: "A", name: "#x" }),
				"A.z (initializer)"
			);

			expect(privateX.kind).toBe("none");
			expect(stringX.kind).toBe("definite");
		});

		it("should relate a #private read to its own field", () => {
			expect.assertions(1);

			const code = ["class A {", "\t#x = 1;", '\t"#x" = 2;', "\ty = this.#x;", "}"].join("\n");

			expect(
				queryInterference(
					code,
					(model) => queryMemberUnit(model, { class: "A", name: "x", private: true }),
					"A.y (initializer)"
				).kind
			).toBe("definite");
		});

		it("should keep static and instance sides of one key apart", () => {
			expect.assertions(2);

			const code = [
				"class A {",
				"\tstatic x = 1;",
				"\tx = 2;",
				"\ty = this.x;",
				"\tstatic z = this.x;",
				"}"
			].join("\n");
			const staticX = (model: Parameters<typeof queryMemberUnit>[0]): string =>
				queryMemberUnit(model, { class: "A", name: "x", static: true });
			const instanceX = (model: Parameters<typeof queryMemberUnit>[0]): string =>
				queryMemberUnit(model, { class: "A", name: "x" });

			expect([
				queryInterference(code, staticX, "A.y (initializer)").kind,
				queryInterference(code, instanceX, "A.y (initializer)").kind
			]).toStrictEqual(["none", "definite"]);
			expect([
				queryInterference(code, staticX, "A.z (initializer)").kind,
				queryInterference(code, instanceX, "A.z (initializer)").kind
			]).toStrictEqual(["definite", "none"]);
		});

		it("should keep the same key of two classes apart", () => {
			expect.assertions(1);

			const code = ["class A {", "\tx = 1;", "}", "class B {", "\tx = 2;", "\ty = this.x;", "}"].join("\n");

			expect(
				queryInterference(
					code,
					(model) => queryMemberUnit(model, { class: "A", name: "x" }),
					"B.y (initializer)"
				).kind
			).toBe("none");
		});
	});

	describe("when listing evidence", () => {
		it("should list every conflicting pair, with the call path", () => {
			expect.assertions(1);

			const code = [
				"class A {",
				"\tx = 1;",
				"\ty = this.x + this.total;",
				"\tget total(): number { return this.x; }",
				"}"
			].join("\n");

			expect(queryInterference(code, "A.x (initializer)", "A.y (initializer)").evidence).toStrictEqual([
				"same-location: write A.x / read A.x",
				"same-location: write A.x / read A.x (A.y (initializer) -calls-> A.total (get))"
			]);
		});

		it("should keep a definite result next to uncertainty, listing both", () => {
			expect.assertions(2);

			const code = [LIB_IMPORT, "class A {", "\ta = 1;", "\tb = log(this) + this.a;", "}"].join("\n");
			const result = queryInterference(code, "A.a (initializer)", "A.b (initializer)");

			expect(result.kind).toBe("definite");
			expect(result.evidence).toStrictEqual([
				"same-location: write A.a / read A.a",
				"opaque: - / unknown receiver-escape: this"
			]);
		});

		it("should list every opaque fact but only the first pairing of outside effects", () => {
			expect.assertions(1);

			const code = [
				LIB_IMPORT,
				"class A {",
				"\ta = log(this) + first() + second();",
				"\tb = log(this) + first();",
				"}"
			].join("\n");

			expect(queryInterference(code, "A.a (initializer)", "A.b (initializer)").evidence).toStrictEqual([
				"opaque: unknown receiver-escape: this / -",
				"opaque: - / unknown receiver-escape: this",
				"outside-effects: unknown call: log(this) / unknown call: log(this)"
			]);
		});

		it("should pair an external read on the first side with an effect on the second", () => {
			expect.assertions(1);

			const code = [LIB_IMPORT, "class A {", "\ta = someGlobal;", "\tb = log();", "}"].join("\n");

			expect(queryInterference(code, "A.a (initializer)", "A.b (initializer)").evidence).toStrictEqual([
				"outside-effects: read global someGlobal (mutable) / unknown call: log()"
			]);
		});
	});

	it("should compare a unit with itself", () => {
		expect.assertions(1);

		const code = ["class A {", "\tx = 1;", "\tbump(): void { this.x += 1; }", "}"].join("\n");

		expect(queryInterference(code, "A.bump", "A.bump").kind).toBe("definite");
	});

	it("should find none between units of unknown ids", () => {
		expect.assertions(1);

		const { model } = analyzeSource("class A {}");

		expect(unitInterference(model, "nope", "nada")).toStrictEqual({ evidence: [], kind: "none" });
	});

	describe("when analyzing a NestJS service", () => {
		it.each([
			{ expected: "definite", first: "OrderService.resetHits", second: "OrderService.findTotal" },
			{ expected: "definite", first: "OrderService.hitCount (get)", second: "OrderService.findTotal" },
			{ expected: "definite", first: "OrderService.hitCount (get)", second: "OrderService.resetHits" },
			{ expected: "none", first: "OrderService.cache (initializer)", second: "OrderService.hits (initializer)" },
			{
				expected: "possible",
				first: "OrderService.logger (initializer)",
				second: "OrderService.cache (initializer)"
			},
			{ expected: "definite", first: "OrderService.constructor", second: "OrderService.findTotal" }
		])("should find $expected interference between $first and $second", ({ expected, first, second }) => {
			expect.assertions(2);

			const result = queryInterference(QUERY_NEST_SERVICE, first, second);

			expect(result.kind).toBe(expected);
			expect(result.reversedKind).toBe(expected);
		});

		it("should explain why resetting hits interferes with a lookup", () => {
			expect.assertions(1);

			expect(
				queryInterference(
					QUERY_NEST_SERVICE,
					"OrderService.resetHits",
					"OrderService.findTotal"
				).evidence.filter((line) => line.startsWith("same-location"))
			).toStrictEqual([
				"same-location: write OrderService.hits / read OrderService.hits (OrderService.findTotal -calls-> OrderService.lookup)",
				"same-location: write OrderService.hits / write OrderService.hits (OrderService.findTotal -calls-> OrderService.lookup)"
			]);
		});
	});

	describe("when analyzing an Angular component", () => {
		it.each([
			{
				expected: "definite",
				first: "CartComponent.label (initializer)",
				second: "CartComponent.selected (initializer)"
			},
			{
				expected: "none",
				first: "CartComponent.onSelect (initializer)",
				second: "CartComponent.label (initializer)"
			},
			{
				expected: "none",
				first: "CartComponent.total (initializer)",
				second: "CartComponent.items (initializer)"
			},
			{
				expected: "none",
				first: "CartComponent.cartService (initializer)",
				second: "CartComponent.items (initializer)"
			}
		])(
			"should find $expected interference between $first and $second under Angular assumptions",
			({ expected, first, second }) => {
				expect.assertions(1);

				expect(queryInterference(QUERY_ANGULAR_COMPONENT, first, second, ANGULAR).kind).toBe(expected);
			}
		);

		it("should run the computed callback eagerly without assumptions", () => {
			expect.assertions(1);

			expect(
				queryInterference(
					QUERY_ANGULAR_COMPONENT,
					"CartComponent.total (initializer)",
					"CartComponent.items (initializer)"
				).kind
			).toBe("definite");
		});

		it("should relate the click handler to the label through refresh", () => {
			expect.assertions(1);

			const { model, unit } = analyzeSource(QUERY_ANGULAR_COMPONENT, ANGULAR);
			const handler = unit("CartComponent.onSelect (initializer) > arrow (line 16)").id;

			expect(unitInterference(model, handler, unit("CartComponent.label (initializer)").id).kind).toBe(
				"definite"
			);
		});
	});
});
