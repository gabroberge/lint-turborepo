import { describe, expect, it } from "vitest";

import { describeCall } from "../testing/describe-call";
import { describeModifierCall } from "../testing/describe-modifier-call";
import { itCall } from "../testing/it-call";
import { isTitledDescribe } from "./is-titled-describe";

describe(isTitledDescribe, () => {
	describe("when the call is a describe", () => {
		it("returns true", () => {
			expect.assertions(1);

			expect(isTitledDescribe(describeCall())).toBe(true);
		});
	});

	describe("when the call is describe.skip", () => {
		it("returns true", () => {
			expect.assertions(1);

			expect(isTitledDescribe(describeModifierCall("skip"))).toBe(true);
		});
	});

	describe("when the call is a describe factory", () => {
		it("returns false", () => {
			expect.assertions(1);

			expect(isTitledDescribe(describeModifierCall("each"))).toBe(false);
		});
	});

	describe("when the call is not a describe", () => {
		it("returns false", () => {
			expect.assertions(1);

			expect(isTitledDescribe(itCall())).toBe(false);
		});
	});
});
