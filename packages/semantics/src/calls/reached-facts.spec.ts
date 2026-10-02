import { describe, expect, it } from "vitest";

import type { AnalyzeOptions } from "../index";
import { analyzeSource } from "../testing/analyze-source";
import { queryDescribeReached } from "../testing/query-describe-reached";
import { QUERY_ANGULAR_ASSUMPTIONS } from "../testing/query-fixtures";
import { reachedFacts } from "./reached-facts";

function reachedFrom(code: string, label: string, options: AnalyzeOptions = {}): string[] {
	const { model, unit } = analyzeSource(code, options);
	return reachedFacts(model, unit(label).id).map((reached) => queryDescribeReached(model, code, reached));
}

describe(reachedFacts, () => {
	it("should list the unit's own facts with an empty path", () => {
		expect.assertions(2);

		const { model, unit } = analyzeSource(["class A {", "\tx = 1;", "\ty = this.x;", "}"].join("\n"));
		const reached = reachedFacts(model, unit("A.y (initializer)").id);

		expect(reached.map((fact) => fact.path)).toStrictEqual([[], []]);
		expect(reached.map((fact) => fact.fact)).toStrictEqual(unit("A.y (initializer)").facts);
	});

	it("should follow calls transitively with the call path", () => {
		expect.assertions(1);

		const code = [
			"class A {",
			"\tx = 1;",
			"\ty = this.outer();",
			"\touter(): number { return this.inner(); }",
			"\tinner(): number { return this.x; }",
			"}"
		].join("\n");

		expect(reachedFrom(code, "A.y (initializer)")).toStrictEqual([
			"call A.outer",
			"write A.y",
			"call A.inner (A.y (initializer) -calls-> A.outer)",
			"read A.x (A.y (initializer) -calls-> A.outer -calls-> A.inner)"
		]);
	});

	it("should follow getters, setters, invoked and may-run functions", () => {
		expect.assertions(1);

		const code = [
			'import { run } from "./lib";',
			"class A {",
			"\tx = 1;",
			"\tget value() { return this.x; }",
			"\tset value(next: number) { this.x = next; }",
			"\tload() {",
			"\t\tthis.value = this.value;",
			"\t\t(() => this.x)();",
			"\t\trun(() => this.x);",
			"\t}",
			"}"
		].join("\n");

		expect(reachedFrom(code, "A.load").filter((line) => line.includes(" -"))).toStrictEqual([
			"write A.x (A.load -calls-> A.value (set))",
			"read A.x (A.load -calls-> A.value (get))",
			"read A.x (A.load -invokes-> A.load > arrow (line 8))",
			"read A.x (A.load -may-run-> A.load > arrow (line 9))"
		]);
	});

	it("should not follow defines edges", () => {
		expect.assertions(1);

		const code = ["class A {", "\tx = 1;", "\tread = () => this.x;", "}"].join("\n");

		expect(reachedFrom(code, "A.read (initializer)")).toStrictEqual([
			"function stored: A.read (initializer) > arrow (line 3)",
			"write A.read"
		]);
	});

	it("should run the stored function once it is called", () => {
		expect.assertions(1);

		const code = ["class A {", "\tx = 1;", "\tread = () => this.x;", "\ty = this.read();", "}"].join("\n");

		expect(reachedFrom(code, "A.y (initializer)")).toStrictEqual([
			"call A.read",
			"write A.y",
			"read A.x (A.y (initializer) -calls-> A.read (initializer) > arrow (line 3))"
		]);
	});

	it("should terminate on mutual recursion and reach each unit once", () => {
		expect.assertions(1);

		const code = [
			"class A {",
			"\tx = 1;",
			"\ty = this.ping();",
			"\tping(): number { return this.pong(); }",
			"\tpong(): number { return this.ping() + this.x; }",
			"}"
		].join("\n");

		expect(reachedFrom(code, "A.y (initializer)")).toStrictEqual([
			"call A.ping",
			"write A.y",
			"call A.pong (A.y (initializer) -calls-> A.ping)",
			"call A.ping (A.y (initializer) -calls-> A.ping -calls-> A.pong)",
			"read A.x (A.y (initializer) -calls-> A.ping -calls-> A.pong)"
		]);
	});

	it("should give the shortest path to a unit reached two ways", () => {
		expect.assertions(1);

		const code = [
			"function leaf() { return counter; }",
			"function middle() { return leaf(); }",
			"function start() { return middle() + leaf(); }",
			"let counter = 0;",
			"counter = 1;"
		].join("\n");

		expect(reachedFrom(code, "start").filter((line) => line.startsWith("read"))).toStrictEqual([
			"read module counter (mutable) (start -calls-> leaf)"
		]);
	});

	it("should reach the callback of an assumed callable the unit calls", () => {
		expect.assertions(1);

		const code = [
			'import { computed, signal } from "@angular/core";',
			"class A {",
			"\tcount = signal(0);",
			"\ttotal = computed(() => this.count() + 1);",
			"\ty = this.total();",
			"}"
		].join("\n");

		expect(reachedFrom(code, "A.y (initializer)", { assumptions: QUERY_ANGULAR_ASSUMPTIONS })).toStrictEqual([
			"call A.total",
			"write A.y",
			"call A.count (A.y (initializer) -may-run-> A.total (initializer) > arrow (line 4))"
		]);
	});

	it("should reach class-definition code from module evaluation", () => {
		expect.assertions(1);

		const code = [
			"let created = 0;",
			"class Cart {",
			"\tstatic first = (created = 1);",
			"\tstatic {",
			"\t\tcreated += 1;",
			"\t}",
			"\titems = (created = 3);",
			"}"
		].join("\n");

		expect(reachedFrom(code, "module").filter((line) => line.includes(" -"))).toStrictEqual([
			"write module created (mutable) (module -evaluates-> Cart.first (initializer))",
			"write static Cart.first (module -evaluates-> Cart.first (initializer))",
			"read module created (mutable) (module -evaluates-> Cart.static block)",
			"write module created (mutable) (module -evaluates-> Cart.static block)"
		]);
	});

	it("should reach the construction code of a module class built with new", () => {
		expect.assertions(1);

		const code = [
			"let created = 0;",
			"class Cart {",
			"\titems = (created = 3);",
			"\tconstructor(private readonly id: number) {",
			"\t\tcreated += 1;",
			"\t}",
			"}",
			"function make() { return new Cart(1); }"
		].join("\n");

		expect(reachedFrom(code, "make")).toStrictEqual([
			"construct module Cart",
			"write module created (mutable) (make -calls-> Cart.items (initializer))",
			"write Cart.items (make -calls-> Cart.items (initializer))",
			"write Cart.id (make -calls-> Cart.constructor)",
			"read module created (mutable) (make -calls-> Cart.constructor)",
			"write module created (mutable) (make -calls-> Cart.constructor)"
		]);
	});

	it("should reach a local function literal the unit binds and calls", () => {
		expect.assertions(1);

		const code = [
			"let hits = 0;",
			"function run() {",
			"\tconst bump = () => { hits += 1; };",
			"\tbump();",
			"}"
		].join("\n");

		expect(reachedFrom(code, "run").filter((line) => line.includes(" -"))).toStrictEqual([
			"read module hits (mutable) (run -may-run-> run > arrow (line 3))",
			"write module hits (mutable) (run -may-run-> run > arrow (line 3))"
		]);
	});

	it("should return nothing for an unknown unit id", () => {
		expect.assertions(1);

		const { model } = analyzeSource("class A {}");

		expect(reachedFacts(model, "no-such-unit")).toStrictEqual([]);
	});
});
