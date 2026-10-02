import { describe, expect, it } from "vitest";

import type { Conflict } from "../conflict/conflict";
import { analyzeClass } from "../testing/analyze-class";
import { FRAMEWORK_ASSUMPTIONS, FRAMEWORK_IMPORT } from "../testing/framework-assumptions";
import { labelledEffects } from "../testing/labelled-effects";
import { lines } from "../testing/lines";
import { initializationEffects } from "./initialization-effects";

interface ConflictCase {
	code: string;
	expected: Conflict;
	first: string;
	name: string;
	second: string;
}

const LIB_IMPORT = 'import { first, LIMIT, log, name, second, Token } from "./lib";';

const CASES: ConflictCase[] = [
	{
		code: lines("class A {", "\ta = 1;", "\tb = this.a + 1;", "}"),
		expected: "definite",
		first: "a",
		name: "an eager read of an earlier field",
		second: "b"
	},
	{
		code: lines("class A {", "\tb = this.a;", "\ta = 1;", "}"),
		expected: "definite",
		first: "b",
		name: "a forward reference to a later field",
		second: "a"
	},
	{
		code: lines(
			"class A {",
			"\tx = 1;",
			"\ty = this.compute();",
			"\tcompute(): number {",
			"\t\treturn this.x;",
			"\t}",
			"}"
		),
		expected: "definite",
		first: "x",
		name: "a read through a method call",
		second: "y"
	},
	{
		code: lines(
			"class A {",
			"\tx = 1;",
			"\ty = this.outer();",
			"\touter(): number {",
			"\t\treturn this.inner();",
			"\t}",
			"\tinner(): number {",
			"\t\treturn this.x;",
			"\t}",
			"}"
		),
		expected: "definite",
		first: "x",
		name: "a read through two methods",
		second: "y"
	},
	{
		code: lines(
			"class A {",
			"\tx = 1;",
			"\ty = this.even(4);",
			"\teven(n: number): boolean {",
			"\t\treturn n === 0 || this.odd(n - 1);",
			"\t}",
			"\todd(n: number): boolean {",
			"\t\treturn n !== 0 && this.even(n - 1) && this.x > 0;",
			"\t}",
			"}"
		),
		expected: "definite",
		first: "x",
		name: "a read through mutually recursive methods",
		second: "y"
	},
	{
		code: lines(
			"class A {",
			"\tx = 1;",
			"\ty = this.total;",
			"\tget total(): number {",
			"\t\treturn this.x;",
			"\t}",
			"}"
		),
		expected: "definite",
		first: "x",
		name: "a read through a getter",
		second: "y"
	},
	{
		code: lines(FRAMEWORK_IMPORT, "class A {", "\tx = cell(1);", "\tdoubled = derive(() => this.x() * 2);", "}"),
		expected: "none",
		first: "x",
		name: "a read deferred by a signal factory",
		second: "doubled"
	},
	{
		code: lines(
			"function derive<T>(fn: () => T): T {",
			"\treturn fn();",
			"}",
			"class A {",
			"\tx = 1;",
			"\tdoubled = derive(() => this.x * 2);",
			"}"
		),
		expected: "definite",
		first: "x",
		name: "a read inside a callback of a local function named like a factory",
		second: "doubled"
	},
	{
		code: lines(
			FRAMEWORK_IMPORT,
			"class A {",
			"\tcount = cell(0);",
			"\tdoubled = derive(() => this.count() * 2);",
			"\tquadrupled = this.doubled() * 2;",
			"}"
		),
		expected: "definite",
		first: "count",
		name: "an eager call of a stored signal-like field reading another one",
		second: "quadrupled"
	},
	{
		code: lines("class A {", "\tx = 1;", "\tread = (): number => this.x;", "}"),
		expected: "none",
		first: "x",
		name: "a read deferred by an arrow-function field",
		second: "read"
	},
	{
		code: lines(LIB_IMPORT, "class A {", "\ta = first();", "\tb = second();", "}"),
		expected: "uncertain",
		first: "a",
		name: "two unknown calls",
		second: "b"
	},
	{
		code: lines(LIB_IMPORT, "class A {", "\ta = log();", "\tb = 1;", "}"),
		expected: "none",
		first: "a",
		name: "an unknown call and a literal",
		second: "b"
	},
	{
		code: lines(LIB_IMPORT, "class A {", "\ta = log();", "\tb = LIMIT;", "}"),
		expected: "none",
		first: "a",
		name: "an unknown call and an imported binding",
		second: "b"
	},
	{
		code: lines(LIB_IMPORT, "const SIZE = 3;", "class A {", "\ta = log();", "\tb = SIZE;", "}"),
		expected: "none",
		first: "a",
		name: "an unknown call and a module const",
		second: "b"
	},
	{
		code: lines(
			"function f(): number {",
			"\treturn 1;",
			"}",
			"class A {",
			"\ta = ((f = (): number => 2), 0);",
			"\tb = f;",
			"}"
		),
		expected: "uncertain",
		first: "a",
		name: "a reassigned function declaration and a read of it",
		second: "b"
	},
	{
		code: lines(
			LIB_IMPORT,
			"let counter = 0;",
			"export function bump(): void {",
			"\tcounter += 1;",
			"}",
			"class A {",
			"\ta = log();",
			"\tb = counter;",
			"}"
		),
		expected: "uncertain",
		first: "a",
		name: "an unknown call and a reassigned module let",
		second: "b"
	},
	{
		code: lines(LIB_IMPORT, "let counter = 0;", "class A {", "\ta = log();", "\tb = counter;", "}"),
		expected: "none",
		first: "a",
		name: "an unknown call and a module let that is never reassigned",
		second: "b"
	},
	{
		code: lines(LIB_IMPORT, "class A {", "\ta = log();", "\tb = someGlobal;", "}"),
		expected: "uncertain",
		first: "a",
		name: "an unknown call and a global",
		second: "b"
	},
	{
		code: lines(LIB_IMPORT, "class A {", "\tother = { value: 1 };", "\ta = log();", "\tb = this.other.value;", "}"),
		expected: "uncertain",
		first: "a",
		name: "an unknown call and a property of another object",
		second: "b"
	},
	{
		code: lines("class A {", "\tz = 1;", '\tb = eval("this.z");', "}"),
		expected: "uncertain",
		first: "z",
		name: "a direct eval and a pure literal",
		second: "b"
	},
	{
		code: lines("const evaluate = eval;", "class A {", "\tz = 1;", '\tb = evaluate("1");', "}"),
		expected: "none",
		first: "z",
		name: "an indirect eval and a pure literal",
		second: "b"
	},
	{
		code: lines(LIB_IMPORT, "class A {", "\ta = log(this);", "\tb = 1;", "}"),
		expected: "uncertain",
		first: "a",
		name: "an escaping this and a literal",
		second: "b"
	},
	{
		code: lines(LIB_IMPORT, "class A {", "\ta = this[name];", "\tb = 1;", "}"),
		expected: "uncertain",
		first: "a",
		name: "a dynamic member access and a literal",
		second: "b"
	},
	{
		code: lines(LIB_IMPORT, "class A extends Object {", "\ta = this.fromBase;", "\tb = 1;", "}"),
		expected: "uncertain",
		first: "a",
		name: "an inherited member read and a literal",
		second: "b"
	},
	{
		code: lines(
			"class A {",
			"\ta = this.init();",
			"\tb = this.y;",
			"\ty = 0;",
			"\tinit(): number {",
			"\t\tthis.y = 1;",
			"\t\treturn 1;",
			"\t}",
			"}"
		),
		expected: "definite",
		first: "a",
		name: "a method write and a read of the same field",
		second: "b"
	},
	{
		code: lines(
			"interface Svc {",
			"\tvalue: number;",
			"}",
			"class A {",
			"\ta = this.svc;",
			"\tb = 1;",
			"\tconstructor(private readonly svc: Svc) {}",
			"}"
		),
		expected: "none",
		first: "a",
		name: "a parameter property read and a literal",
		second: "b"
	},
	{
		code: lines("class A {", "\tconstructor(private p: number) {}", "\tb = (this.p = 2);", "\ta = this.p;", "}"),
		expected: "definite",
		first: "b",
		name: "a parameter property written and then read",
		second: "a"
	},
	{
		code: lines("class A {", "\tconstructor(private p = 1) {}", "\tb = (this.p = 2);", "\ta = this.p;", "}"),
		expected: "definite",
		first: "b",
		name: "a defaulted parameter property written and then read",
		second: "a"
	},
	{
		code: lines(FRAMEWORK_IMPORT, LIB_IMPORT, "class A {", "\tsvc = provide(Token);", "\ta = log();", "}"),
		expected: "none",
		first: "svc",
		name: "a factory call and an unknown call",
		second: "a"
	},
	{
		code: lines(LIB_IMPORT, "class A {", "\tstatic a = log();", "\tb = log();", "}"),
		expected: "none",
		first: "a",
		name: "a static and an instance initializer",
		second: "b"
	},
	{
		code: lines(LIB_IMPORT, "class A {", "\tstatic a = 1;", "\tstatic {", "\t\tlog();", "\t}", "}"),
		expected: "uncertain",
		first: "a",
		name: "a static field and a static block",
		second: "static block"
	},
	{
		code: lines("class A {", "\tstatic a = new this();", "\tstatic b = 1;", "}"),
		expected: "uncertain",
		first: "a",
		name: "a static self instantiation and a literal",
		second: "b"
	},
	{
		code: lines("class Config {", "\tstatic base = 1;", "\tstatic derived = Config.base + 1;", "}"),
		expected: "definite",
		first: "base",
		name: "a static read through the class name",
		second: "derived"
	}
];

describe(initializationEffects, () => {
	it.each(CASES)("should find $expected conflict for $name", ({ code, expected, first, second }) => {
		expect.assertions(1);

		expect(analyzeClass(code, FRAMEWORK_ASSUMPTIONS).conflict(first, second)).toBe(expected);
	});

	it("should follow a recursive method pair once", () => {
		expect.assertions(1);

		const code = lines(
			"class A {",
			"\tx = 1;",
			"\ty = this.ping();",
			"\tping(): number {",
			"\t\treturn this.pong();",
			"\t}",
			"\tpong(): number {",
			"\t\treturn this.ping() + this.x;",
			"\t}",
			"}"
		);

		expect(labelledEffects(code, initializationEffects)("y")).toMatchObject({
			calls: new Set(["ping", "pong", "x"]),
			reads: new Set(["x"])
		});
	});

	it("should mark a static self instantiation opaque", () => {
		expect.assertions(1);

		const code = lines("class A {", "\tstatic a = new this();", "}");

		expect(labelledEffects(code, initializationEffects)("a")).toMatchObject({ opaque: true, sideEffects: true });
	});

	it("should record a write to another field", () => {
		expect.assertions(1);

		const code = lines("class A {", "\ty = 0;", "\ta = (this.y = 2);", "}");

		expect(labelledEffects(code, initializationEffects)("a")?.writes).toStrictEqual(new Set(["y"]));
	});

	it.each([
		{ code: lines("class A {", "\tm(): void {}", "}"), label: "m", name: "a method" },
		{ code: lines("class A {", "\tconstructor() {}", "}"), label: "constructor", name: "a constructor" },
		{ code: lines("class A {", "\tdeclare x: number;", "}"), label: "x", name: "a declared field" }
	])("should return null for $name", ({ code, label }) => {
		expect.assertions(1);

		expect(labelledEffects(code, initializationEffects)(label)).toBeNull();
	});

	it("should return empty effects for a field without initializer", () => {
		expect.assertions(1);

		expect(labelledEffects(lines("class A {", "\tx?: number;", "}"), initializationEffects)("x")).toStrictEqual({
			calls: new Set(),
			external: false,
			opaque: false,
			reads: new Set(),
			sideEffects: false,
			writes: new Set()
		});
	});

	it("should not count invoking a signal-factory field as a side effect", () => {
		expect.assertions(1);

		const code = lines(FRAMEWORK_IMPORT, "class A {", "\tcount = cell(0);", "\tread = this.count();", "}");

		expect(labelledEffects(code, initializationEffects, FRAMEWORK_ASSUMPTIONS)("read")).toMatchObject({
			external: true,
			reads: new Set(["count"]),
			sideEffects: false
		});
	});

	it("should count invoking a plain field as a side effect", () => {
		expect.assertions(1);

		const code = lines(FRAMEWORK_IMPORT, "class A {", "\tcount = provide(0);", "\tread = this.count();", "}");

		expect(labelledEffects(code, initializationEffects, FRAMEWORK_ASSUMPTIONS)("read")).toMatchObject({
			external: true,
			reads: new Set(["count"]),
			sideEffects: true
		});
	});

	it("should run the functions stored in an invoked function field", () => {
		expect.assertions(1);

		const code = lines(
			LIB_IMPORT,
			"class A {",
			"\tx = 1;",
			"\tfn = (): void => log(this.x);",
			"\ta = this.fn();",
			"}"
		);

		expect(labelledEffects(code, initializationEffects)("a")).toMatchObject({
			calls: new Set(["fn", "x"]),
			reads: new Set(["fn", "x"]),
			sideEffects: true
		});
	});

	it("should leave the callback of a factory out of the field's own effects", () => {
		expect.assertions(1);

		const code = lines(FRAMEWORK_IMPORT, "class A {", "\tx = cell(1);", "\ty = derive(() => this.x());", "}");

		expect(labelledEffects(code, initializationEffects, FRAMEWORK_ASSUMPTIONS)("y")).toStrictEqual({
			calls: new Set(),
			external: false,
			opaque: false,
			reads: new Set(),
			sideEffects: false,
			writes: new Set()
		});
	});

	it("should run the callback of an unknown call eagerly", () => {
		expect.assertions(1);

		const code = lines(FRAMEWORK_IMPORT, "class A {", "\tx = cell(1);", "\ty = derive(() => this.x());", "}");

		expect(labelledEffects(code, initializationEffects)("y")).toMatchObject({
			reads: new Set(["x"]),
			sideEffects: true
		});
	});

	it("should mark a computed-key field opaque", () => {
		expect.assertions(1);

		const code = lines(LIB_IMPORT, "class A {", "\t[name] = 1;", "}");

		expect(labelledEffects(code, initializationEffects)("[name]")).toMatchObject({ opaque: true });
	});
});
