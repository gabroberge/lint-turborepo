import { describe, expect, it } from "vitest";

import { leastSpecificPath } from "./least-specific-path";

describe(leastSpecificPath, () => {
	it("returns the path that would shadow the others", () => {
		expect.assertions(1);

		expect(leastSpecificPath(["active", ":id", "*path"])).toBe("*path");
	});

	it("returns a parameter over a static sibling", () => {
		expect.assertions(1);

		expect(leastSpecificPath([":id", "active"])).toBe(":id");
	});

	it("returns the only path", () => {
		expect.assertions(1);

		expect(leastSpecificPath(["active"])).toBe("active");
	});
});
