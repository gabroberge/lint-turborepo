import { describe, expect, it } from "vitest";

import { pair } from "../testing/pair";
import { compareExportKind } from "./compare-export-kind";

describe(compareExportKind, () => {
	describe("when both statements are the same kind", () => {
		it("returns zero", () => {
			expect.assertions(1);

			const [left, right] = pair('export { a } from "./m";\nexport { b } from "./n";');

			expect(compareExportKind(left, right)).toBe(0);
		});
	});

	describe("when a type export is compared with a value export", () => {
		it("orders the type export after the value export", () => {
			expect.assertions(1);

			const [value, typeExport] = pair('export { a } from "./m";\nexport type { b } from "./n";');

			expect(compareExportKind(value, typeExport)).toBeLessThan(0);
		});
	});
});
