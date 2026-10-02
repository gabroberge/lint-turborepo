import { describe, expect, it } from "vitest";

import { analyzeSource } from "./testing/analyze-source";

describe("analyzeModule", () => {
	it("records the facts of a field initializer", () => {
		expect.assertions(1);

		const { facts } = analyzeSource(
			"let total = 0;\nclass Cart {\n\tcount = total + this.base();\n\tbase() { return 1; }\n}"
		);

		expect(facts("Cart.count (initializer)")).toStrictEqual([
			"read module total",
			"call Cart.base",
			"write Cart.count"
		]);
	});
});
