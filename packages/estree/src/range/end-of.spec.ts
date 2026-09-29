import { describe, expect, it } from "vitest";

import { endOf } from "./end-of";

describe(endOf, () => {
	it("should return the second bound of the range", () => {
		expect.assertions(1);

		expect(endOf({ range: [4, 9] })).toBe(9);
	});
});
