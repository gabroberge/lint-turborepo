import { describe, expect, it } from "vitest";

import { classifyPlaceholders } from "./classify";

describe(classifyPlaceholders, () => {
	it("should wrap a title without parameters", () => {
		expect.assertions(1);

		expect(classifyPlaceholders("the value is missing", "returns null")).toBe("wrap");
	});

	it("should promote a condition-only parameter", () => {
		expect.assertions(1);

		expect(classifyPlaceholders("%s", "adds")).toBe("promote");
	});

	it("should promote named and numeric condition placeholders", () => {
		expect.assertions(2);

		expect(classifyPlaceholders("$mode", "returns null")).toBe("promote");
		expect(classifyPlaceholders("$0", "returns null")).toBe("promote");
	});

	it("should keep outcome-only parameters on the wrap path", () => {
		expect.assertions(1);

		expect(classifyPlaceholders("the flag is unset", "formats $value")).toBe("wrap");
	});

	it("should refuse parameters on both sides", () => {
		expect.assertions(1);

		expect(classifyPlaceholders("%s", "returns %i")).toBeNull();
	});

	it("should refuse an escaped percent on the outcome of a parameterized condition", () => {
		expect.assertions(1);

		expect(classifyPlaceholders("%s", "returns 100%%")).toBeNull();
	});

	it("should refuse an escaped percent on the condition", () => {
		expect.assertions(1);

		expect(classifyPlaceholders("mode = %%", "returns null")).toBeNull();
	});
});
