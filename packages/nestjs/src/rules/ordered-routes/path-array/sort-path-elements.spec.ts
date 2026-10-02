import { describe, expect, it } from "vitest";

import { element } from "../testing/element";
import { sortPathElements } from "./sort-path-elements";

describe(sortPathElements, () => {
	it("orders by path specificity and keeps ties in source order", () => {
		expect.assertions(1);

		const param = element(":id");
		const firstStatic = element("active");
		const secondStatic = element("other");

		expect(sortPathElements([param, firstStatic, secondStatic])).toStrictEqual([firstStatic, secondStatic, param]);
	});
});
