import type { ESTree } from "@oxlint/plugins";
import { describe, expect, it } from "vitest";

import type { AccessFact, AccessMode, AccessTarget } from "../index";
import { conflicts } from "./conflicts";

const NODE = { type: "Identifier" } as unknown as ESTree.Node;
const X: AccessTarget = {
	class: "c1",
	key: { name: "x", private: false },
	kind: "member",
	member: "d1",
	static: false
};
const Y: AccessTarget = {
	class: "c1",
	key: { name: "y", private: false },
	kind: "member",
	member: "d2",
	static: false
};

function access(mode: AccessMode, target: AccessTarget = X): AccessFact {
	return { kind: "access", mode, node: NODE, target };
}

describe(conflicts, () => {
	it.each([
		{ conflict: false, left: "read", right: "read" },
		{ conflict: true, left: "read", right: "write" },
		{ conflict: true, left: "write", right: "write" },
		{ conflict: true, left: "call", right: "write" },
		{ conflict: false, left: "call", right: "call" },
		{ conflict: false, left: "call", right: "read" }
	] satisfies { conflict: boolean; left: AccessMode; right: AccessMode }[])(
		"should decide $conflict for $left against $right of one location",
		({ conflict, left, right }) => {
			expect.assertions(2);

			expect(conflicts(access(left), access(right))).toBe(conflict);
			expect(conflicts(access(right), access(left))).toBe(conflict);
		}
	);

	it("should find no conflict between writes of two locations", () => {
		expect.assertions(1);

		expect(conflicts(access("write", X), access("write", Y))).toBe(false);
	});
});
