import { describe, expect, it } from "vitest";

import type { AnalyzeOptions, ModuleModel, UnitId } from "../index";
import { analyzeSource } from "../testing/analyze-source";
import { queryLabel } from "../testing/query-describe-edge";
import { recursiveUnitGroups } from "./recursive-unit-groups";

function groupsOf(code: string, options: AnalyzeOptions = {}): string[][] {
	const { model } = analyzeSource(code, options);
	return labelled(model, recursiveUnitGroups(model));
}

function labelled(model: ModuleModel, groups: UnitId[][]): string[][] {
	return groups.map((group) => group.map((unit) => queryLabel(model, unit)).toSorted());
}

describe(recursiveUnitGroups, () => {
	it("should find a self-recursive function", () => {
		expect.assertions(1);

		expect(groupsOf("function fact(n: number): number { return n <= 1 ? 1 : n * fact(n - 1); }")).toStrictEqual([
			["fact"]
		]);
	});

	it("should group mutually recursive module functions", () => {
		expect.assertions(1);

		const code = [
			"function even(n: number): boolean { return n === 0 || odd(n - 1); }",
			"function odd(n: number): boolean { return n !== 0 && even(n - 1); }"
		].join("\n");

		expect(groupsOf(code)).toStrictEqual([["even", "odd"]]);
	});

	it("should group mutually recursive methods", () => {
		expect.assertions(1);

		const code = [
			"class A {",
			"\tping(): number { return this.pong(); }",
			"\tpong(): number { return this.ping(); }",
			"\tother(): number { return this.ping(); }",
			"}"
		].join("\n");

		expect(groupsOf(code)).toStrictEqual([["A.ping", "A.pong"]]);
	});

	it("should find a cycle through a callback handed to unknown code", () => {
		expect.assertions(1);

		const code = [
			'import { schedule } from "./lib";',
			"class Poller {",
			"\tpoll(): void {",
			"\t\tschedule(() => this.poll());",
			"\t}",
			"}"
		].join("\n");

		expect(groupsOf(code)).toStrictEqual([["Poller.poll", "Poller.poll > arrow (line 4)"]]);
	});

	it("should not close a cycle through a defines edge", () => {
		expect.assertions(2);

		const code = [
			'import { computed } from "./lib";',
			"function start(): unknown {",
			"\treturn computed(() => start());",
			"}"
		].join("\n");

		expect(groupsOf(code, { assumptions: { assumeCall: () => "factory" } })).toStrictEqual([]);
		expect(groupsOf(code)).toStrictEqual([["start", "start > arrow (line 3)"]]);
	});

	it("should find a cycle through a field holding an arrow", () => {
		expect.assertions(1);

		const code = [
			"class A {",
			"\thandler = () => this.start();",
			"\tstart(): void {",
			"\t\tthis.handler();",
			"\t}",
			"}"
		].join("\n");

		expect(groupsOf(code)).toStrictEqual([["A.handler (initializer) > arrow (line 2)", "A.start"]]);
	});

	it("should find a class whose field initializer constructs the class again", () => {
		expect.assertions(1);

		const code = ["class Tree {", "\tchild = Math.random() > 0.5 ? new Tree() : null;", "}"].join("\n");

		expect(groupsOf(code)).toStrictEqual([["Tree.child (initializer)"]]);
	});

	it("should return nothing for an acyclic module", () => {
		expect.assertions(1);

		expect(groupsOf("function a() { return b(); }\nfunction b() { return 1; }")).toStrictEqual([]);
	});
});
