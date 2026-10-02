import { describe, expect, it } from "vitest";

import { resolveMethodOrder } from "./resolve-method-order";

describe(resolveMethodOrder, () => {
	it("honors a custom method order and appends omitted methods", () => {
		expect.assertions(1);

		expect(resolveMethodOrder(["DELETE", "GET"]).slice(0, 4)).toStrictEqual(["DELETE", "GET", "POST", "PATCH"]);
	});

	it("uppercases configured methods and keeps the first occurrence", () => {
		expect.assertions(1);

		expect(resolveMethodOrder(["get", "GET", "delete"]).slice(0, 3)).toStrictEqual(["GET", "DELETE", "POST"]);
	});
});
