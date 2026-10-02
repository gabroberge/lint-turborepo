import { describe, expect, it } from "vitest";

import type { HttpRoute } from "../decorator/http-route-from-decorator";
import { fakeDecorator } from "../testing/fake-decorator";
import { decoratedRoute } from "./decorated-route";

describe(decoratedRoute, () => {
	describe("when the route is missing", () => {
		it("returns an empty list", () => {
			expect.assertions(1);

			expect(decoratedRoute(fakeDecorator(), null)).toStrictEqual([]);
		});
	});

	describe("when the route is present", () => {
		it("returns that decorated route", () => {
			expect.assertions(1);

			const decorator = fakeDecorator();
			const route: HttpRoute = { method: "GET", paths: { paths: ["active"], type: "static" } };

			expect(decoratedRoute(decorator, route)).toStrictEqual([{ decorator, route }]);
		});
	});
});
