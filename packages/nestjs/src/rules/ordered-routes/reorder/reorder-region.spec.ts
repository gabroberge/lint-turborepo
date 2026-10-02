import { describe, expect, it } from "vitest";

import { resolveMethodOrder } from "../../../order-routes";
import { handler } from "../testing/handler";
import { reorderRegion } from "./reorder-region";

const methodOrder = resolveMethodOrder(undefined);

describe(reorderRegion, () => {
	it("produces no edits when the region is already ordered", () => {
		expect.assertions(1);

		const active = handler({ method: "GET", originalText: "active", path: "active" });
		const param = handler({ method: "GET", originalText: "param", path: ":id" });

		expect(reorderRegion([active, param], methodOrder)).toStrictEqual({
			blockedByUnfixedArray: false,
			edits: [],
			reportNode: null
		});
	});

	it("writes sorted texts into the original ranges", () => {
		expect.assertions(1);

		const param = handler({ method: "GET", originalText: "param", path: ":id", range: [0, 5] });
		const active = handler({ method: "GET", originalText: "active", path: "active", range: [6, 12] });

		expect(reorderRegion([param, active], methodOrder).edits).toStrictEqual([
			{ range: [0, 5], text: "active" },
			{ range: [6, 12], text: "param" }
		]);
	});

	describe("when a path array cannot be rewritten", () => {
		it("reports the decorator that should occupy that position", () => {
			expect.assertions(1);

			const current = handler({ method: "GET", originalText: "current", path: "active" });
			const blocked = handler({
				method: "GET",
				originalText: "blocked",
				path: ":id",
				unfixedArray: true
			});

			expect(reorderRegion([current, blocked], methodOrder).reportNode).toBe(blocked.reportNode);
		});
	});

	describe("when handlers move", () => {
		it("reports the decorator that currently occupies the first changed position", () => {
			expect.assertions(1);

			const param = handler({ method: "GET", originalText: "param", path: ":id" });
			const active = handler({ method: "GET", originalText: "active", path: "active" });

			expect(reorderRegion([param, active], methodOrder).reportNode).toBe(param.reportNode);
		});
	});
});
