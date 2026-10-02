import { describe, expect, it } from "vitest";

import { analyzeSource } from "../testing/analyze-source";
import { queryDescribeEdge } from "../testing/query-describe-edge";
import { queryMemberUnit } from "../testing/query-member-unit";
import { callEdgesFrom } from "./call-edges-from";

function edgesOf(code: string, label: string): string[] {
	const { model, unit } = analyzeSource(code);
	return callEdgesFrom(model, unit(label).id).map((edge) => queryDescribeEdge(model, edge));
}

describe(callEdgesFrom, () => {
	it("should give a direct method call a calls edge", () => {
		expect.assertions(1);

		const code = ["class Cart {", "\ttotal() { return this.base(); }", "\tbase() { return 1; }", "}"].join("\n");

		expect(edgesOf(code, "Cart.total")).toStrictEqual(["Cart.total -calls-> Cart.base"]);
	});

	it("should run a getter on read", () => {
		expect.assertions(1);

		const code = [
			"class Cart {",
			"\tcount = 0;",
			"\tget value() { return this.count; }",
			"\ttotal() { return this.value; }",
			"}"
		].join("\n");

		expect(edgesOf(code, "Cart.total")).toStrictEqual(["Cart.total -calls-> Cart.value (get)"]);
	});

	it("should run a setter on write", () => {
		expect.assertions(1);

		const code = [
			"class Cart {",
			"\tcount = 0;",
			"\tset value(next: number) { this.count = next; }",
			"\treset() { this.value = 0; }",
			"}"
		].join("\n");

		expect(edgesOf(code, "Cart.reset")).toStrictEqual(["Cart.reset -calls-> Cart.value (set)"]);
	});

	it("should run the setter of an accessor pair declared getter first", () => {
		expect.assertions(1);

		const code = [
			"class Cart {",
			"\tcount = 0;",
			"\tget value() { return this.count; }",
			"\tset value(next: number) { this.count = next; }",
			"\tbump() { this.value = this.value + 1; }",
			"}"
		].join("\n");

		expect(edgesOf(code, "Cart.bump")).toStrictEqual([
			"Cart.bump -calls-> Cart.value (set)",
			"Cart.bump -calls-> Cart.value (get)"
		]);
	});

	it("should run the getter of an accessor pair declared setter first", () => {
		expect.assertions(1);

		const code = [
			"class Cart {",
			"\tcount = 0;",
			"\tset value(next: number) { this.count = next; }",
			"\tget value() { return this.count; }",
			"\ttotal() { return this.value; }",
			"}"
		].join("\n");

		expect(edgesOf(code, "Cart.total")).toStrictEqual(["Cart.total -calls-> Cart.value (get)"]);
	});

	it("should call the arrow a field holds through this.f()", () => {
		expect.assertions(2);

		const code = [
			"class Cart {",
			"\tcount = 0;",
			"\tf = () => this.count;",
			"\ttotal() { return this.f(); }",
			"}"
		].join("\n");

		expect(edgesOf(code, "Cart.total")).toStrictEqual([
			"Cart.total -calls-> Cart.f (initializer) > arrow (line 3)"
		]);
		expect(edgesOf(code, "Cart.f (initializer)")).toStrictEqual([
			"Cart.f (initializer) -defines-> Cart.f (initializer) > arrow (line 3)"
		]);
	});

	it("should call both a field arrow and a method sharing one key", () => {
		expect.assertions(1);

		const code = [
			"class Cart {",
			"\tm() { return 1; }",
			"\tm = () => 2;",
			"\ttotal() { return this.m(); }",
			"}"
		].join("\n");

		expect(edgesOf(code, "Cart.total")).toStrictEqual([
			"Cart.total -calls-> Cart.m",
			"Cart.total -calls-> Cart.m (initializer) > arrow (line 3)"
		]);
	});

	it("should give an IIFE an invokes edge", () => {
		expect.assertions(1);

		const code = ["class Cart {", "\tload() {", "\t\treturn (() => 1)();", "\t}", "}"].join("\n");

		expect(edgesOf(code, "Cart.load")).toStrictEqual(["Cart.load -invokes-> Cart.load > arrow (line 3)"]);
	});

	it("should give a callback passed to unknown code a may-run edge", () => {
		expect.assertions(1);

		const code = [
			'import { schedule } from "./lib";',
			"class Cart {",
			"\tload() {",
			"\t\tschedule(() => 1);",
			"\t}",
			"}"
		].join("\n");

		expect(edgesOf(code, "Cart.load")).toStrictEqual(["Cart.load -may-run-> Cart.load > arrow (line 4)"]);
	});

	it("should give a callback passed to an assumed factory a defines edge", () => {
		expect.assertions(1);

		const code = ['import { computed } from "./lib";', "class Cart {", "\ttotal = computed(() => 1);", "}"].join(
			"\n"
		);
		const { model, unit } = analyzeSource(code, { assumptions: { assumeCall: () => "factory" } });

		expect(
			callEdgesFrom(model, unit("Cart.total (initializer)").id).map((edge) => queryDescribeEdge(model, edge))
		).toStrictEqual(["Cart.total (initializer) -defines-> Cart.total (initializer) > arrow (line 3)"]);
	});

	it("should give an arrow stored in a field or an object element a defines edge", () => {
		expect.assertions(1);

		const code = ["class Cart {", "\thandlers = {", "\t\tclick: () => 1", "\t};", "}"].join("\n");

		expect(edgesOf(code, "Cart.handlers (initializer)")).toStrictEqual([
			"Cart.handlers (initializer) -defines-> Cart.handlers (initializer) > arrow (line 3)"
		]);
	});

	it("should give an arrow assigned to a member a may-run edge, not defines", () => {
		expect.assertions(1);

		const code = [
			"class Cart {",
			"\tload() {",
			"\t\tthis.handler = () => 1;",
			"\t}",
			"\thandler?: () => number;",
			"}"
		].join("\n");

		// Pinned: the value of an assignment expression flows as `run`, even as a statement.
		expect(edgesOf(code, "Cart.load")).toStrictEqual(["Cart.load -may-run-> Cart.load > arrow (line 3)"]);
	});

	it("should give an arrow bound to a local const a may-run edge", () => {
		expect.assertions(1);

		const code = ["class Cart {", "\tload() {", "\t\tconst f = () => 1;", "\t\treturn f();", "\t}", "}"].join("\n");

		expect(edgesOf(code, "Cart.load")).toStrictEqual(["Cart.load -may-run-> Cart.load > arrow (line 3)"]);
	});

	it("should follow calls between module functions", () => {
		expect.assertions(2);

		const code = ["function a() { return b(); }", "function b() { return 1; }", "a();"].join("\n");

		expect(edgesOf(code, "a")).toStrictEqual(["a -calls-> b"]);
		expect(edgesOf(code, "module")).toStrictEqual([
			"module -defines-> a",
			"module -defines-> b",
			"module -calls-> a"
		]);
	});

	it("should call the arrow a module const holds", () => {
		expect.assertions(1);

		const code = ["const helper = () => 1;", "function a() { return helper(); }"].join("\n");

		expect(edgesOf(code, "a")).toStrictEqual(["a -calls-> module > arrow (line 1)"]);
	});

	it("should give no edge to imports, globals or properties of other objects", () => {
		expect.assertions(1);

		const code = [
			'import { load } from "./lib";',
			"class Cart {",
			"\tconstructor(private readonly api: { get: () => number }) {}",
			'\trun() { return load() + parseInt("1") + this.api.get() + this.missing(); }',
			"}"
		].join("\n");

		expect(edgesOf(code, "Cart.run")).toStrictEqual([]);
	});

	it("should give a method read as a value a may-run edge", () => {
		expect.assertions(1);

		const code = [
			"class Cart {",
			"\tload() { return [1].map(this.convert); }",
			"\tconvert(value: number) { return value; }",
			"}"
		].join("\n");

		expect(edgesOf(code, "Cart.load")).toStrictEqual(["Cart.load -may-run-> Cart.convert"]);
	});

	it("should give a module function read as a value a may-run edge", () => {
		expect.assertions(1);

		const code = [
			"function convert(value: number) { return value; }",
			"function load() { return [1].map(convert); }"
		].join("\n");

		expect(edgesOf(code, "load")).toStrictEqual(["load -may-run-> convert"]);
	});

	it("should reach static members through the class name", () => {
		expect.assertions(1);

		const code = ["class Config {", "\tstatic base() { return 1; }", "\tstatic derived = Config.base();", "}"].join(
			"\n"
		);

		expect(edgesOf(code, "Config.derived (initializer)")).toStrictEqual([
			"Config.derived (initializer) -calls-> Config.base"
		]);
	});

	it("should keep static and instance members with one key apart", () => {
		expect.assertions(2);

		const code = [
			"class Cart {",
			"\tstatic make() { return 1; }",
			"\tmake() { return 2; }",
			"\tstatic a = this.make();",
			"\tb = this.make();",
			"}"
		].join("\n");
		const { model } = analyzeSource(code);
		const describeEdges = (unit: string): string[] =>
			callEdgesFrom(model, unit).map((edge) => `${edge.kind} ${String(model.units.get(edge.to)?.node.range[0])}`);
		const staticMake = model.units.get(queryMemberUnit(model, { class: "Cart", name: "make", static: true }));
		const instanceMake = model.units.get(queryMemberUnit(model, { class: "Cart", name: "make" }));

		expect(describeEdges(queryMemberUnit(model, { class: "Cart", name: "a", static: true }))).toStrictEqual([
			`calls ${String(staticMake?.node.range[0])}`
		]);
		expect(describeEdges(queryMemberUnit(model, { class: "Cart", name: "b" }))).toStrictEqual([
			`calls ${String(instanceMake?.node.range[0])}`
		]);
	});

	it("should carry the fact each edge derives from", () => {
		expect.assertions(2);

		const code = ["class Cart {", "\ttotal() { return this.base(); }", "\tbase() { return 1; }", "}"].join("\n");
		const { model, unit } = analyzeSource(code);
		const [edge] = callEdgesFrom(model, unit("Cart.total").id);

		expect(edge?.fact).toBe(unit("Cart.total").facts[0]);
		expect(edge?.fact).toMatchObject({ kind: "access", mode: "call" });
	});

	it("should return nothing for an unknown unit id", () => {
		expect.assertions(1);

		const { model } = analyzeSource("class Cart {}");

		expect(callEdgesFrom(model, "no-such-unit")).toStrictEqual([]);
	});
});
