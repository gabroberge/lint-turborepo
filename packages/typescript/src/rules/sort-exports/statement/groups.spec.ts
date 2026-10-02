import { describe, expect, it } from "vitest";

import { lines } from "../testing/lines";
import { parse } from "../testing/parse";
import { groups } from "./groups";
import { modulePath } from "./module-path";

describe(groups, () => {
	it("keeps consecutive export-from statements in one group", () => {
		expect.assertions(1);

		const found = groups(parse(lines('export { b } from "./b";', 'export { a } from "./a";')).body);

		expect(found.map((group) => group.map(modulePath))).toStrictEqual([["./b", "./a"]]);
	});

	it("starts a new group after another statement", () => {
		expect.assertions(1);

		const found = groups(
			parse(lines('export { b } from "./b";', "export const local = 1;", 'export { a } from "./a";')).body
		);

		expect(found.map((group) => group.map(modulePath))).toStrictEqual([["./b"], ["./a"]]);
	});
});
