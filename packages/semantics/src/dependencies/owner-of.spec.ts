import { describe, expect, it } from "vitest";

import { analyzeSource } from "../testing/analyze-source";
import { ownerOf } from "./owner-of";

const CODE = [
	"const handler = () => [1].map((value) => value);",
	"class Cart {",
	"\tload() {",
	"\t\treturn [1].map((value) => () => value);",
	"\t}",
	"}",
	"[2].forEach((value) => value);"
].join("\n");

describe(ownerOf, () => {
	it("should give a member unit its own declaration", () => {
		expect.assertions(1);

		const { model, unit } = analyzeSource(CODE);

		expect(model.declarations.get(ownerOf(model, unit("Cart.load").id) ?? "")?.qualifiedName).toBe("Cart.load");
	});

	it("should give nested arrows the declaration of the nearest enclosing unit that has one", () => {
		expect.assertions(2);

		const { model } = analyzeSource(CODE);
		const ownersOf = (line: number): (string | undefined)[] =>
			[...model.units.values()]
				.filter((unit) => unit.kind === "function" && unit.node.loc.start.line === line)
				.map((unit) => model.declarations.get(ownerOf(model, unit.id) ?? "")?.qualifiedName);

		expect(ownersOf(1)).toStrictEqual(["handler", "handler"]);
		expect(ownersOf(4)).toStrictEqual(["Cart.load", "Cart.load"]);
	});

	it("should give module code and arrows in it no owner", () => {
		expect.assertions(2);

		const { model, unit } = analyzeSource(CODE);

		expect(ownerOf(model, model.moduleUnit)).toBeNull();
		expect(ownerOf(model, unit("module > arrow (line 7)").id)).toBeNull();
	});

	it("should give an unknown unit id no owner", () => {
		expect.assertions(1);

		const { model } = analyzeSource(CODE);

		expect(ownerOf(model, "no-such-unit")).toBeNull();
	});
});
