import { describe, expect, it } from "vitest";

import { identifier } from "../testing/identifier";
import { authoredTree } from "./authored-tree";
import { structuralIdentity } from "./structural-identity";

describe(structuralIdentity, () => {
	describe("when two nodes have the same authored tree", () => {
		it("returns the same identity", () => {
			expect.assertions(1);

			expect(structuralIdentity(identifier("value"))).toBe(structuralIdentity(identifier("value")));
		});
	});

	describe("when two nodes differ in an authored property", () => {
		it("returns different identities", () => {
			expect.assertions(1);

			expect(structuralIdentity(identifier("left"))).not.toBe(structuralIdentity(identifier("right")));
		});
	});

	describe("when an authored tree is serialized", () => {
		it("returns the JSON of that tree", () => {
			expect.assertions(1);

			const node = identifier("value");

			expect(structuralIdentity(node)).toBe(JSON.stringify(authoredTree(node)));
		});
	});
});
