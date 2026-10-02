import { describe, expect, it } from "vitest";

import { pair } from "../testing/pair";
import { isTypeExport } from "./is-type-export";

describe(isTypeExport, () => {
	it("should recognize export type", () => {
		expect.assertions(1);

		const [typeExport] = pair('export type { a } from "./m";\nexport { b } from "./n";');

		expect(isTypeExport(typeExport)).toBe(true);
	});

	it("should reject a value export", () => {
		expect.assertions(1);

		const [valueExport] = pair('export { a } from "./m";\nexport { b } from "./n";');

		expect(isTypeExport(valueExport)).toBe(false);
	});

	it("should reject a value export with an inline type specifier", () => {
		expect.assertions(1);

		const [inlineType] = pair('export { type a } from "./m";\nexport { b } from "./n";');

		expect(isTypeExport(inlineType)).toBe(false);
	});
});
