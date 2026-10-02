import { describe, expect, it } from "vitest";

import { modulePath } from "../statement/module-path";
import { names } from "../statement/names";
import { groupOf } from "../testing/group-of";
import { lines } from "../testing/lines";
import { parse } from "../testing/parse";
import { isSorted } from "./is-sorted";
import { order } from "./order";

describe(order, () => {
	it("orders statements by module path", () => {
		expect.assertions(1);

		const group = groupOf(
			parse(
				lines('export { sameLiteral } from "./shape/same-literal";', 'export { endOf } from "./range/end-of";')
			).body
		);

		expect(order(group).map(modulePath)).toStrictEqual(["./range/end-of", "./shape/same-literal"]);
	});

	it("orders statements of one module by exported name", () => {
		expect.assertions(1);

		const group = groupOf(parse(lines('export { zed } from "./m";', 'export { amy } from "./m";')).body);

		expect(order(group).map(names)).toStrictEqual([["amy"], ["zed"]]);
	});

	it("keeps source order when path and names match", () => {
		expect.assertions(2);

		const group = groupOf(parse(lines('export { a } from "./m";', 'export { a } from "./m";')).body);

		expect(isSorted(group)).toBe(true);
		expect(order(group)).toStrictEqual([...group]);
	});
});
