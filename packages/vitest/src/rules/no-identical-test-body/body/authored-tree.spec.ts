import type { ESTree } from "@oxlint/plugins";
import { describe, expect, it } from "vitest";

import { identifier } from "../testing/identifier";
import { node } from "../testing/node";
import { authoredTree } from "./authored-tree";

describe(authoredTree, () => {
	describe("when only location and comments differ", () => {
		it("returns the same authored tree", () => {
			expect.assertions(1);

			const authored = identifier("value");
			const annotated = identifier("value", {
				leadingComments: [{ type: "Line", value: " note" }],
				loc: { end: { column: 1, line: 1 }, start: { column: 0, line: 1 } },
				parent: identifier("owner"),
				range: [0, 5]
			});

			expect(authoredTree(authored)).toStrictEqual(authoredTree(annotated));
		});
	});

	describe("when object keys are inserted in a different order", () => {
		it("returns the same authored tree", () => {
			expect.assertions(1);

			expect(
				authoredTree(
					node([
						["b", 2],
						["a", 1]
					])
				)
			).toStrictEqual(
				authoredTree(
					node([
						["a", 1],
						["b", 2]
					])
				)
			);
		});
	});

	describe("when the only extra property is a function", () => {
		it("returns the same authored tree", () => {
			expect.assertions(1);

			const plain = identifier("value");
			const withMethod = identifier("value", { walk: () => undefined });

			expect(authoredTree(plain)).toStrictEqual(authoredTree(withMethod));
		});
	});

	describe("when the tree contains a bigint or a RegExp", () => {
		it("encodes them as strings", () => {
			expect.assertions(2);

			expect(authoredTree(identifier("value", { literal: 1n }))).toStrictEqual({
				literal: "1n",
				name: "value",
				type: "Identifier"
			});
			expect(authoredTree(identifier("value", { literal: /ab/gi }))).toStrictEqual({
				literal: "/ab/gi",
				name: "value",
				type: "Identifier"
			});
		});
	});

	describe("when parent is circular", () => {
		it("returns an authored tree", () => {
			expect.assertions(1);

			const cycle: Record<string, unknown> = { name: "value", type: "Identifier" };
			cycle["parent"] = cycle;

			expect(authoredTree(cycle as unknown as ESTree.Node)).toStrictEqual(authoredTree(identifier("value")));
		});
	});
});
