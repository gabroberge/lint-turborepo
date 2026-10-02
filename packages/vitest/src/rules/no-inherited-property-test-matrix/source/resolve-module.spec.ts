import path from "node:path";
import { describe, expect, it } from "vitest";

import { resolveModule } from "./resolve-module";

const fromFile = path.join(import.meta.dirname, "../fixtures/derived.dto.ts");

describe(resolveModule, () => {
	it("resolves a relative .js specifier to the TypeScript file", () => {
		expect.assertions(1);

		expect(resolveModule(fromFile, "./base.dto.js")).toBe(
			path.join(import.meta.dirname, "../fixtures/base.dto.ts")
		);
	});

	it("returns null for a package specifier", () => {
		expect.assertions(1);

		expect(resolveModule(fromFile, "@nestjs/common")).toBeNull();
	});

	it("returns null when the module cannot be found", () => {
		expect.assertions(1);

		expect(resolveModule(fromFile, "./missing.dto.js")).toBeNull();
	});
});
