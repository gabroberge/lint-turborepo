import "reflect-metadata";

import type { INestApplication } from "@nestjs/common";
import { afterEach, describe, expect, it } from "vitest";

import { boot } from "../testing/boot";
import { call } from "../testing/call";
import type { Entry } from "../testing/entry";
import { handler } from "../testing/handler";
import { sortEntries } from "../testing/sort-entries";

const apps: INestApplication[] = [];

describe("express registration order", () => {
	afterEach(async () => {
		await Promise.all(apps.splice(0).map(async (app) => app.close()));
	});

	describe("when methods follow the comparator", () => {
		const entries: Entry[] = [
			{ body: "param", method: "GET", name: "findOne", path: ":id" },
			{ body: "post", method: "POST", name: "create" },
			{ body: "wild", method: "GET", name: "catchAll", path: "*path" },
			{ body: "details", method: "GET", name: "details", path: ":id/details" },
			{ body: "all", method: "ALL", name: "all", path: ":id" },
			{ body: "active", method: "GET", name: "findActive", path: "active" },
			{ body: "head", method: "HEAD", name: "headActive", path: "active" },
			{ body: "root", method: "GET", name: "findAll" }
		];

		it("reaches static, parameter, wildcard, and root handlers", async () => {
			expect.assertions(5);

			const { app, baseUrl } = await boot(sortEntries(entries));
			apps.push(app);

			await expect(call(baseUrl, "/users/active")).resolves.toBe("active");
			await expect(call(baseUrl, "/users/abc/details")).resolves.toBe("details");
			await expect(call(baseUrl, "/users/abc")).resolves.toBe("param");
			await expect(call(baseUrl, "/users/abc/extra")).resolves.toBe("wild");
			await expect(call(baseUrl, "/users")).resolves.toBe("root");
		});

		it("reaches post and head handlers", async () => {
			expect.assertions(2);

			const { app, baseUrl } = await boot(sortEntries(entries));
			apps.push(app);

			await expect(call(baseUrl, "/users", "POST")).resolves.toBe("post");
			await expect(handler(baseUrl, "/users/active", "HEAD")).resolves.toBe("head");
		});
	});

	it("shows a parameter route shadowing a later static route", async () => {
		expect.assertions(1);

		const { app, baseUrl } = await boot([
			{ body: "param", method: "GET", name: "findOne", path: ":id" },
			{ body: "active", method: "GET", name: "findActive", path: "active" }
		]);
		apps.push(app);

		await expect(call(baseUrl, "/users/active")).resolves.toBe("param");
	});
});
