import { describe, expect, it } from "vitest";

import { analyzeSource } from "../testing/analyze-source";
import { describeUnit, unitLabels } from "../testing/extraction-lookup";
import { buildModuleUnit } from "./build-module-unit";

describe(buildModuleUnit, () => {
	it("should root the module unit at the program, with no receiver and no parent", () => {
		expect.assertions(3);

		const { model, unit } = analyzeSource("setup();");

		expect(model.moduleUnit).toBe(unit("module").id);
		expect(unit("module").code.map((root) => root.type)).toStrictEqual(["Program"]);
		expect(describeUnit(model, unit("module"))).toBe("module | module-evaluation | this: none | root | of nothing");
	});

	it("should build a stored unit with an unknown receiver for each module function declaration", () => {
		expect.assertions(2);

		const { facts, model, unit } = analyzeSource("export function load() {}\nasync function* stream() {}");

		expect(facts("module")).toStrictEqual(["function stored: load", "function stored: stream"]);
		expect(describeUnit(model, unit("load"))).toBe("function | invocation | this: unknown | in module | of load");
	});

	it("should own a function literal by the module variable it initializes", () => {
		expect.assertions(3);

		const { facts, model, unit } = analyzeSource("const arrow = () => 1;\nlet fn = function named() {};");

		expect(facts("module")).toStrictEqual([
			"function stored: module > arrow (line 1)",
			"function stored: module > function named (line 2)"
		]);
		expect(describeUnit(model, unit("module > arrow (line 1)"))).toBe(
			"function | invocation | this: none | in module | of arrow"
		);
		expect(describeUnit(model, unit("module > function named (line 2)"))).toBe(
			"function | invocation | this: unknown | in module | of fn"
		);
	});

	it("should own a function literal in a stored object by the variable, and walk the object's computed keys", () => {
		expect.assertions(2);

		const { facts, model, unit } = analyzeSource("const handlers = { [KEY]: 1, load() {}, ...rest };");

		expect(facts("module")).toStrictEqual([
			"read global KEY (mutable)",
			"function stored: module > function (line 1)",
			"read global rest (mutable)"
		]);
		expect(describeUnit(model, unit("module > function (line 1)"))).toBe(
			"function | invocation | this: unknown | in module | of handlers"
		);
	});

	it("should leave the unit of an anonymous default function without a declaration, although one is declared", () => {
		expect.assertions(2);

		const { model, unit } = analyzeSource("export default function () {}");

		expect([...model.declarations.values()].map((declaration) => declaration.qualifiedName)).toStrictEqual([
			"default"
		]);
		expect(describeUnit(model, unit("default"))).toBe(
			"function | invocation | this: unknown | in module | of nothing"
		);
	});

	it("should store a default-exported expression without an owner", () => {
		expect.assertions(2);

		const { facts, unit } = analyzeSource("export default () => 1;");

		expect(facts("module")).toStrictEqual(["function stored: module > arrow (line 1)"]);
		expect(unit("module > arrow (line 1)").declaration).toBeNull();
	});

	it("should build the units of a const-bound class expression, without reading it in module code", () => {
		expect.assertions(2);

		const { facts, model } = analyzeSource("const Cart = class { count = 0; };");

		expect(unitLabels(model)).toStrictEqual(["module", "Cart.count (initializer)"]);
		expect(facts("module")).toStrictEqual([]);
	});

	it("should walk the other top-level statements as run code, skipping imports, types and re-exports (in no specified order)", () => {
		expect.assertions(1);

		const { facts } = analyzeSource(
			'import { a } from "lib";\ntype T = 1;\nexport * from "x";\nexport { b } from "y";\nlet n = 0;\nn++;\nif (a) { start(() => n); }'
		);

		expect(facts("module").toSorted((left, right) => left.localeCompare(right))).toStrictEqual([
			"call global start (mutable)",
			"function passed-to-unknown: module > arrow (line 7)",
			"read import a",
			"read module n (mutable)",
			"unknown call: start(() => n)",
			"write module n (mutable)"
		]);
	});

	it("should parent nested function literals to the unit whose code contains them", () => {
		expect.assertions(2);

		const { model, unit } = analyzeSource(
			"function outer() {\n\tconst inner = () => {\n\t\tlist.map((x) => x);\n\t};\n}"
		);

		expect(describeUnit(model, unit("outer > arrow (line 2)"))).toBe(
			"function | invocation | this: unknown | in outer | of nothing"
		);
		expect(describeUnit(model, unit("outer > arrow (line 2) > arrow (line 3)"))).toBe(
			"function | invocation | this: unknown | in outer > arrow (line 2) | of nothing"
		);
	});
});
