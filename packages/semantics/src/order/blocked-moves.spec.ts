import { describe, expect, it } from "vitest";

import { blockedKeyPairs } from "../testing/blocked-key-pairs";
import { blockedMoves } from "./blocked-moves";

describe(blockedMoves, () => {
	it("should report a preferred swap held back by an uncertain conflict", () => {
		expect.assertions(1);

		expect(blockedKeyPairs(["a", "b"], ["b", "a"], { "a-b": "uncertain" })).toStrictEqual([["a", "b"]]);
	});

	it("should not report a definite conflict", () => {
		expect.assertions(1);

		expect(blockedKeyPairs(["a", "b"], ["b", "a"], { "a-b": "definite" })).toStrictEqual([]);
	});

	it("should not report an uncertain pair already in preferred order", () => {
		expect.assertions(1);

		expect(blockedKeyPairs(["a", "b"], ["a", "b"], { "a-b": "uncertain" })).toStrictEqual([]);
	});

	it("should not report a pair chained by definite conflicts", () => {
		expect.assertions(1);

		expect(
			blockedKeyPairs(["a", "b", "c"], ["c", "a", "b"], {
				"a-b": "definite",
				"a-c": "uncertain",
				"b-c": "definite"
			})
		).toStrictEqual([]);
	});

	it("should report each held member once against its first blocker", () => {
		expect.assertions(1);

		expect(
			blockedKeyPairs(["a", "b", "c"], ["c", "a", "b"], { "a-c": "uncertain", "b-c": "uncertain" })
		).toStrictEqual([["a", "c"]]);
	});

	it("should report several held members", () => {
		expect.assertions(1);

		expect(
			blockedKeyPairs(["a", "b", "c"], ["c", "b", "a"], { "a-b": "uncertain", "b-c": "uncertain" })
		).toStrictEqual([
			["a", "b"],
			["b", "c"]
		]);
	});
});
