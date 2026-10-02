import { describe, expect, it } from "vitest";

import type { EffectsStub } from "../testing/effects-stub";
import { effectsStub } from "../testing/effects-stub";
import { memberStub } from "../testing/member-stub";
import type { Conflict } from "./conflict";
import { conflictBetween } from "./conflict-between";

interface Case {
	expected: Conflict;
	left: EffectsStub;
	name: string;
	right: EffectsStub;
}

const LEFT = memberStub({ index: 0, key: "left" });
const RIGHT = memberStub({ index: 1, key: "right" });

const CASES: Case[] = [
	{ expected: "none", left: {}, name: "two pure initializers", right: {} },
	{ expected: "definite", left: { reads: ["right"] }, name: "a read of the other member", right: {} },
	{ expected: "definite", left: {}, name: "a read of the member by the later one", right: { reads: ["left"] } },
	{ expected: "definite", left: { writes: ["right"] }, name: "a write of the other member", right: {} },
	{ expected: "definite", left: { writes: ["x"] }, name: "a write read by the other", right: { reads: ["x"] } },
	{ expected: "definite", left: { reads: ["x"] }, name: "a read written by the other", right: { writes: ["x"] } },
	{ expected: "definite", left: { writes: ["x"] }, name: "two writes of one member", right: { writes: ["x"] } },
	{ expected: "none", left: { reads: ["x"] }, name: "two reads of one member", right: { reads: ["x"] } },
	{
		expected: "definite",
		left: { opaque: true, reads: ["right"] },
		name: "a definite read despite opacity",
		right: {}
	},
	{ expected: "uncertain", left: { opaque: true }, name: "an opaque initializer", right: {} },
	{ expected: "uncertain", left: {}, name: "an opaque later initializer", right: { opaque: true } },
	{ expected: "uncertain", left: { sideEffects: true }, name: "two side effects", right: { sideEffects: true } },
	{
		expected: "uncertain",
		left: { sideEffects: true },
		name: "a side effect and an external read",
		right: { external: true }
	},
	{
		expected: "uncertain",
		left: { external: true },
		name: "an external read and a later side effect",
		right: { sideEffects: true }
	},
	{ expected: "none", left: { external: true }, name: "two external reads", right: { external: true } },
	{ expected: "none", left: { sideEffects: true }, name: "a side effect and a pure initializer", right: {} },
	{ expected: "none", left: { calls: ["right"] }, name: "an unresolved call record", right: {} }
];

describe(conflictBetween, () => {
	it.each(CASES)("should find $expected conflict for $name", ({ expected, left, right }) => {
		expect.assertions(2);

		expect(conflictBetween(LEFT, effectsStub(left), RIGHT, effectsStub(right))).toBe(expected);
		expect(conflictBetween(RIGHT, effectsStub(right), LEFT, effectsStub(left))).toBe(expected);
	});

	it("should ignore a member without key", () => {
		expect.assertions(1);

		const computed = memberStub({ index: 1, key: null });

		expect(conflictBetween(LEFT, effectsStub({ reads: ["member"] }), computed, effectsStub())).toBe("none");
	});
});
