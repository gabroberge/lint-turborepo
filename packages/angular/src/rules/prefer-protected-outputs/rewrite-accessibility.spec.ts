import { describe, expect, it } from "vitest";

import { rewriteAccessibility } from "./rewrite-accessibility";

describe(rewriteAccessibility, () => {
	it("should replace public", () => {
		expect.assertions(1);

		expect(rewriteAccessibility("public ")).toBe("protected ");
	});

	it("should replace private", () => {
		expect.assertions(1);

		expect(rewriteAccessibility("private ")).toBe("protected ");
	});

	it("should replace public before readonly", () => {
		expect.assertions(1);

		expect(rewriteAccessibility("public readonly ")).toBe("protected readonly ");
	});

	it("should insert protected before readonly", () => {
		expect.assertions(1);

		expect(rewriteAccessibility("readonly ")).toBe("protected readonly ");
	});

	it("should insert protected when no modifier is present", () => {
		expect.assertions(1);

		expect(rewriteAccessibility("")).toBe("protected ");
	});

	it("should keep leading indentation", () => {
		expect.assertions(1);

		expect(rewriteAccessibility("\tpublic ")).toBe("\tprotected ");
	});
});
