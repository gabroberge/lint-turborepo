import { describe, expect, it } from "vitest";

import { identifier } from "../testing/identifier";
import { namesOfExported } from "./names-of-exported";

describe(namesOfExported, () => {
	describe("when the exported name is missing", () => {
		it("returns an empty list", () => {
			expect.assertions(1);

			expect(namesOfExported(null)).toStrictEqual([]);
		});
	});

	describe("when the exported name is present", () => {
		it("returns that name", () => {
			expect.assertions(1);

			expect(namesOfExported(identifier("ns"))).toStrictEqual(["ns"]);
		});
	});
});
