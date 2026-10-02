import { describe, expect, it } from "vitest";

import type { ModuleModel, UnitId } from "../index";
import { analyzeSource } from "../testing/analyze-source";
import { decisionPoints } from "./decision-points";

const CODE = [
	"const ready = Math.random() > 0.5 ? true : false;",
	"if (ready) {",
	"\tconsole.log(ready && 1);",
	"}",
	"function helper(value?: number) {",
	"\treturn value ?? 0;",
	"}",
	"class Cart {",
	"\tcount = ready ? 1 : 0;",
	"\tload(items: number[]) {",
	"\t\tfor (const item of items) {",
	"\t\t\tif (item > 0) {",
	"\t\t\t\titems.filter((other) => other > 0 && other < item);",
	"\t\t\t}",
	"\t\t}",
	"\t}",
	"}",
	"[1].forEach((value) => value || 2);"
].join("\n");

function kindsIn(model: ModuleModel, unit: UnitId): string[] {
	return decisionPoints(model, unit).map((point) => `${point.kind}@${String(point.node.loc.start.line)}`);
}

describe(decisionPoints, () => {
	it("should keep module code apart from functions and class bodies", () => {
		expect.assertions(1);

		const { model } = analyzeSource(CODE);

		expect(kindsIn(model, model.moduleUnit)).toStrictEqual(["conditional@1", "if@2", "logical-and@3"]);
	});

	it("should attribute decisions to the unit whose own code holds them", () => {
		expect.assertions(3);

		const { model, unit } = analyzeSource(CODE);

		expect(kindsIn(model, unit("helper").id)).toStrictEqual(["nullish@6"]);
		expect(kindsIn(model, unit("Cart.count (initializer)").id)).toStrictEqual(["conditional@9"]);
		expect(kindsIn(model, unit("Cart.load").id)).toStrictEqual(["loop@11", "if@12"]);
	});

	it("should give nested function literals their own decisions", () => {
		expect.assertions(2);

		const { model, unit } = analyzeSource(CODE);

		expect(kindsIn(model, unit("Cart.load > arrow (line 13)").id)).toStrictEqual(["logical-and@13"]);
		expect(kindsIn(model, unit("module > arrow (line 18)").id)).toStrictEqual(["logical-or@18"]);
	});

	it("should count each decision of the module exactly once across units", () => {
		expect.assertions(1);

		const { model } = analyzeSource(CODE);
		const all = [...model.units.keys()].flatMap((unit) => decisionPoints(model, unit).map((point) => point.node));

		expect(new Set(all).size).toBe(all.length);
	});

	it("should keep the code of an unanalyzed nested class with its enclosing unit", () => {
		expect.assertions(1);

		const code = [
			"function make() {",
			"\treturn class {",
			"\t\tvalue = Math.random() > 0.5 ? 1 : 2;",
			"\t};",
			"}"
		].join("\n");
		const { model, unit } = analyzeSource(code);

		expect(kindsIn(model, unit("make").id)).toStrictEqual(["conditional@3"]);
	});

	it("should return nothing for an unknown unit id", () => {
		expect.assertions(1);

		const { model } = analyzeSource(CODE);

		expect(decisionPoints(model, "no-such-unit")).toStrictEqual([]);
	});
});
