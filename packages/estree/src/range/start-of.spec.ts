import { describe, expect, it } from "vitest";

import { startOf } from "./start-of";

describe(startOf, () => {
	it("should return the first bound of the range", () => {
		expect.assertions(1);

		expect(startOf({ range: [4, 9] })).toBe(4);
	});
});
