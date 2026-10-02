import { describe, expect, it } from "vitest";

import { applyPathArrayRewrite } from "./apply-path-array-rewrite";

describe(applyPathArrayRewrite, () => {
	it("splices a sorted replacement into the method text", () => {
		expect.assertions(1);

		expect(
			applyPathArrayRewrite('@Get([":id", "active"]) both() {}', 0, {
				kind: "sorted",
				range: [5, 22],
				replacement: '["active", ":id"]'
			})
		).toBe('@Get(["active", ":id"]) both() {}');
	});

	it("leaves the method text unchanged when the rewrite is blocked", () => {
		expect.assertions(1);

		expect(applyPathArrayRewrite('@Get([":id", "active"]) both() {}', 0, { kind: "blocked" })).toBe(
			'@Get([":id", "active"]) both() {}'
		);
	});
});
