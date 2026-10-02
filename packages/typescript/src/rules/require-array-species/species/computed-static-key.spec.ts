import { describe, expect, it } from "vitest";

import { identifier } from "../testing/identifier";
import { methodDefinition } from "../testing/method-definition";
import { staticBlock } from "../testing/static-block";
import { computedStaticKey } from "./computed-static-key";

describe(computedStaticKey, () => {
	describe("when the member is static and computed", () => {
		it("returns the key", () => {
			expect.assertions(1);

			const key = identifier("species");

			expect(
				computedStaticKey(
					methodDefinition({
						computed: true,
						key,
						static: true
					})
				)
			).toBe(key);
		});
	});

	describe("when the member is a static block", () => {
		it("returns null", () => {
			expect.assertions(1);

			expect(computedStaticKey(staticBlock())).toBeNull();
		});
	});
});
