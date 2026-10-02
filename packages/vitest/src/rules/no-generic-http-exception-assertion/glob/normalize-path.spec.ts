import { describe, expect, it } from "vitest";

import { normalizePath } from "./normalize-path";

describe(normalizePath, () => {
	it("should rewrite backslashes as slashes", () => {
		expect.assertions(1);

		expect(normalizePath("src\\foo.spec.ts")).toBe("src/foo.spec.ts");
	});
});
