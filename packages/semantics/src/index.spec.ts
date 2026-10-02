import { describe, expect, it } from "vitest";

import { classConstraints } from "./testing/class-constraints";
import { conflictByKey } from "./testing/conflict-by-key";
import { lines } from "./testing/lines";
import { preferredOrder } from "./testing/preferred-order";

import type { ClassAssumptions } from "./index";
import { blockedMoves, constrainedOrder, hasInertKey, NO_ASSUMPTIONS } from "./index";

/** A consumer's knowledge of its own library: `cell` and `derive` build signal-like values. */
const STORE_ASSUMPTIONS: ClassAssumptions = {
	assumeCall: (call) =>
		call.callee.type === "Identifier" && ["cell", "derive"].includes(call.callee.name) ? "signal-factory" : null
};

const CART = lines(
	'import { cell, derive } from "./store";',
	'import { connect } from "./api";',
	"export class Cart {",
	"\tprivate readonly items = cell<string[]>([]);",
	"\tprotected readonly total = derive(() => this.items().length);",
	"\tpublic readonly ready = this.total() > 0;",
	"\tpublic readonly api = connect();",
	'\tpublic label = "cart";',
	"\tpublic add(item: string): void {",
	"\t\tthis.items.set([...this.items(), item]);",
	"\t}",
	"}"
);

describe("index", () => {
	it("should describe the members of a class", () => {
		expect.assertions(2);

		const { members } = classConstraints(CART, STORE_ASSUMPTIONS);

		expect(members.map(({ key, timeline, visibility }) => [key, timeline, visibility])).toStrictEqual([
			["items", "instance", "private"],
			["total", "instance", "protected"],
			["ready", "instance", "public"],
			["api", "instance", "public"],
			["label", "instance", "public"],
			["add", null, "public"]
		]);
		expect(members.every(({ node }) => hasInertKey(node))).toBe(true);
	});

	it("should order members as close to the preference as their conflicts allow", () => {
		expect.assertions(1);

		const { conflictAt, members } = classConstraints(CART, STORE_ASSUMPTIONS);
		const order = constrainedOrder(
			members,
			preferredOrder,
			(earlier, later) => conflictAt(earlier, later) !== "none"
		);

		expect(order.map(({ key }) => key)).toStrictEqual(["label", "total", "items", "ready", "api", "add"]);
	});

	it("should report a preferred move held back by an uncertain conflict", () => {
		expect.assertions(1);

		const { conflictAt, members } = classConstraints(CART, STORE_ASSUMPTIONS);

		expect(
			blockedMoves(members, preferredOrder, conflictAt).map(({ earlier, later }) => [earlier.key, later.key])
		).toStrictEqual([["ready", "api"]]);
	});

	it("should constrain more without assumptions", () => {
		expect.assertions(2);

		expect(conflictByKey(classConstraints(CART, STORE_ASSUMPTIONS), "items", "total")).toBe("none");
		expect(conflictByKey(classConstraints(CART, NO_ASSUMPTIONS), "items", "total")).toBe("definite");
	});
});
