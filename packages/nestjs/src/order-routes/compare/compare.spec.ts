import { describe, expect, it } from "vitest";

import { resolveMethodOrder } from "../method/resolve-method-order";
import { order } from "../testing/order";
import { compareRouteKeys } from "./compare";

describe(compareRouteKeys, () => {
	it("orders different methods before comparing paths", () => {
		expect.assertions(1);

		expect(
			order([
				{ method: "GET", path: "active" },
				{ method: "POST", path: "*path" },
				{ method: "DELETE", path: ":id" },
				{ method: "PATCH", path: "" }
			])
		).toStrictEqual(["POST *path", "GET active", "PATCH ", "DELETE :id"]);
	});

	it("orders same-method routes by specificity and keeps ties in source order", () => {
		expect.assertions(1);

		expect(
			order([
				{ method: "GET", path: ":id" },
				{ method: "GET", path: "zeta" },
				{ method: "GET", path: "alpha" },
				{ method: "GET", path: ":id/details" },
				{ method: "GET", path: "*path" },
				{ method: "GET", path: "" }
			])
		).toStrictEqual(["GET ", "GET zeta", "GET alpha", "GET :id", "GET :id/details", "GET *path"]);
	});

	it("places a static GET ahead of an overlapping ALL or HEAD parameter", () => {
		expect.assertions(1);

		expect(
			order([
				{ method: "ALL", path: ":id" },
				{ method: "GET", path: "active" },
				{ method: "HEAD", path: ":id" }
			])
		).toStrictEqual(["GET active", "HEAD :id", "ALL :id"]);
	});

	describe("when the same pattern would swallow HEAD", () => {
		it("places HEAD before GET", () => {
			expect.assertions(1);

			expect(
				order([
					{ method: "GET", path: "active" },
					{ method: "HEAD", path: "active" },
					{ method: "ALL", path: "active" }
				])
			).toStrictEqual(["HEAD active", "GET active", "ALL active"]);
		});
	});

	it("uses method order for GET and HEAD routes that cannot match the same request", () => {
		expect.assertions(1);

		expect(
			order([
				{ method: "HEAD", path: "users" },
				{ method: "GET", path: "orders" }
			])
		).toStrictEqual(["GET orders", "HEAD users"]);
	});

	it("honors a custom method order", () => {
		expect.assertions(1);

		expect(
			compareRouteKeys(
				{ method: "GET", path: "" },
				{ method: "DELETE", path: "" },
				resolveMethodOrder(["DELETE", "GET"])
			)
		).toBeGreaterThan(0);
	});
});
