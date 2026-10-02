import { describe, expect, it } from "vitest";

import { handler } from "../testing/handler";
import { sortableRegions } from "./sortable-regions";

describe(sortableRegions, () => {
	it("keeps consecutive handlers in one region", () => {
		expect.assertions(1);

		expect(sortableRegions([handler("active"), handler(":id")])).toStrictEqual([
			[handler("active"), handler(":id")]
		]);
	});

	it("starts a new region after a barrier", () => {
		expect.assertions(1);

		expect(sortableRegions([handler("before"), { kind: "barrier" }, handler("after")])).toStrictEqual([
			[handler("before")],
			[handler("after")]
		]);
	});

	it("drops a leading or repeated barrier", () => {
		expect.assertions(1);

		expect(
			sortableRegions([{ kind: "barrier" }, { kind: "barrier" }, handler("only"), { kind: "barrier" }])
		).toStrictEqual([[handler("only")]]);
	});
});
