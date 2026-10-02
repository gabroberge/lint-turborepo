import { describe, expect, it } from "vitest";

import { decorated } from "../testing/decorated";
import { fakeDecorator } from "../testing/fake-decorator";
import { movableHttpRoute } from "./movable-http-route";

describe(movableHttpRoute, () => {
	it("keeps a single static HTTP route", () => {
		expect.assertions(1);

		const decorator = fakeDecorator();
		const routes = [decorated(decorator, { method: "GET", paths: { paths: ["active", ":id"], type: "static" } })];

		expect(movableHttpRoute(routes)).toStrictEqual({
			decorator,
			method: "GET",
			paths: ["active", ":id"]
		});
	});

	it("rejects multiple HTTP decorators", () => {
		expect.assertions(1);

		expect(
			movableHttpRoute([
				decorated(fakeDecorator(), { method: "GET", paths: { paths: ["active"], type: "static" } }),
				decorated(fakeDecorator(), { method: "POST", paths: { paths: [""], type: "static" } })
			])
		).toBeNull();
	});

	it("rejects a dynamic path", () => {
		expect.assertions(1);

		expect(
			movableHttpRoute([decorated(fakeDecorator(), { method: "GET", paths: { type: "dynamic" } })])
		).toBeNull();
	});

	it("rejects an empty list", () => {
		expect.assertions(1);

		expect(movableHttpRoute([])).toBeNull();
	});
});
