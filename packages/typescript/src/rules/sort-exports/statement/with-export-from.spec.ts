import { describe, expect, it } from "vitest";

import { pair } from "../testing/pair";
import { withExportFrom } from "./with-export-from";

describe(withExportFrom, () => {
	describe("when the group is missing", () => {
		it("starts a group with that statement", () => {
			expect.assertions(1);

			const [statement] = pair('export { a } from "./a";\nexport { b } from "./b";');

			expect(withExportFrom(null, statement)).toStrictEqual([statement]);
		});
	});

	describe("when the group already has a statement", () => {
		it("appends the next statement", () => {
			expect.assertions(1);

			const [left, right] = pair('export { a } from "./a";\nexport { b } from "./b";');

			expect(withExportFrom([left], right)).toStrictEqual([left, right]);
		});
	});
});
