import { describe, expect, it } from "vitest";

import { bindings } from "../testing/bindings";
import { identifier } from "../testing/identifier";
import { member } from "../testing/member";
import { resolveDecorator } from "./resolve-decorator";

describe(resolveDecorator, () => {
	it("resolves a local identifier", () => {
		expect.assertions(1);

		expect(resolveDecorator(identifier("Get"), bindings())).toStrictEqual({ method: "GET", type: "method" });
	});

	it("resolves a namespaced member", () => {
		expect.assertions(1);

		expect(resolveDecorator(member("nest", "Get"), bindings())).toStrictEqual({ method: "GET", type: "method" });
	});

	it("rejects a member on a non-namespace binding", () => {
		expect.assertions(1);

		expect(resolveDecorator(member("Get", "name"), bindings())).toBeNull();
	});

	it("rejects an unknown identifier", () => {
		expect.assertions(1);

		expect(resolveDecorator(identifier("Injectable"), bindings())).toBeNull();
	});
});
