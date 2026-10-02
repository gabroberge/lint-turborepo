import { describe, expect, it } from "vitest";

import { lines } from "../testing/lines";
import { pair } from "../testing/pair";
import { compare } from "./compare";

describe(compare, () => {
	it("orders by module path before exported names", () => {
		expect.assertions(1);

		const [fromZed, fromAmy] = pair(lines('export { amy } from "./z";', 'export { zed } from "./a";'));

		expect(compare(fromZed, fromAmy)).toBeGreaterThan(0);
	});

	it("orders statements of one module by exported name", () => {
		expect.assertions(1);

		const [zed, amy] = pair(lines('export { zed } from "./m";', 'export { amy } from "./m";'));

		expect(compare(zed, amy)).toBeGreaterThan(0);
	});

	it("orders a type export after a value export of the same module", () => {
		expect.assertions(1);

		const [value, typeExport] = pair(lines('export { apple } from "./m";', 'export type { zebra } from "./m";'));

		expect(compare(value, typeExport)).toBeLessThan(0);
	});

	it("treats the same names as equal regardless of specifier order", () => {
		expect.assertions(1);

		const [zedFirst, amyFirst] = pair(lines('export { z, a } from "./m";', 'export { a, z } from "./m";'));

		expect(compare(zedFirst, amyFirst)).toBe(0);
	});

	it("compares several names lexicographically after sorting them", () => {
		expect.assertions(1);

		const [later, earlier] = pair(lines('export { a, c } from "./m";', 'export { a, b } from "./m";'));

		expect(compare(later, earlier)).toBeGreaterThan(0);
	});

	it("orders a shorter name list before a prefixed longer one", () => {
		expect.assertions(1);

		const [longer, shorter] = pair(lines('export { a, b } from "./m";', 'export { a } from "./m";'));

		expect(compare(longer, shorter)).toBeGreaterThan(0);
	});
});
