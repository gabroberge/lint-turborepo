import type { ESTree } from "@oxlint/plugins";
import { describe, expect, it } from "vitest";

import { pathElement } from "../testing/path-element";
import { reconstructArray } from "./reconstruct-array";

describe(reconstructArray, () => {
	it("rebuilds the array with the original separator and brackets", () => {
		expect.assertions(1);

		const fileText = '[":id", "active"]';
		const param = pathElement(":id", 1, 6);
		const active = pathElement("active", 8, 16);
		const array = {
			elements: [param.element, active.element],
			range: [0, 17],
			type: "ArrayExpression"
		} as ESTree.ArrayExpression;

		expect(reconstructArray(fileText, array, [param, active], [active, param])).toBe('["active", ":id"]');
	});
});
