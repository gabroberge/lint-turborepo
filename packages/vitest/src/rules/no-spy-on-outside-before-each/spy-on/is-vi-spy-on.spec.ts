import { describe, expect, it } from "vitest";

import { spyOnCall } from "../testing/spy-on-call";
import { isViSpyOn } from "./is-vi-spy-on";

describe(isViSpyOn, () => {
	it("should recognize vi.spyOn", () => {
		expect.assertions(1);

		expect(isViSpyOn(spyOnCall("vi", "spyOn"))).toBe(true);
	});

	it("should reject jest.spyOn", () => {
		expect.assertions(1);

		expect(isViSpyOn(spyOnCall("jest", "spyOn"))).toBe(false);
	});

	it("should reject an optional vi.spyOn", () => {
		expect.assertions(1);

		expect(isViSpyOn(spyOnCall("vi", "spyOn", { optional: true }))).toBe(false);
	});

	it('should reject computed vi["spyOn"]', () => {
		expect.assertions(1);

		expect(isViSpyOn(spyOnCall("vi", "spyOn", { computed: true }))).toBe(false);
	});

	it("should reject a different vi method", () => {
		expect.assertions(1);

		expect(isViSpyOn(spyOnCall("vi", "fn"))).toBe(false);
	});
});
