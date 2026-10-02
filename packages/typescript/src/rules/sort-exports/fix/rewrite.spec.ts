import { describe, expect, it } from "vitest";

import { groupOf } from "../testing/group-of";
import { lines } from "../testing/lines";
import { parse } from "../testing/parse";
import { requireSource } from "../testing/require-source";
import { analyze } from "./analyze";
import { rewrite } from "./rewrite";

describe(rewrite, () => {
	describe("when analysis is missing", () => {
		it("returns null", () => {
			expect.assertions(1);

			const parsed = parse(lines('export { b } from "./b";', 'export { a } from "./a";'));

			expect(rewrite(null, groupOf(parsed.body))).toBeNull();
		});
	});

	describe("when analysis is present", () => {
		it("returns the replacement text", () => {
			expect.assertions(1);

			const parsed = parse(lines('export { b } from "./b";', 'export { a } from "./a";'));
			const group = groupOf(parsed.body);
			const replacement = rewrite(requireSource(analyze(parsed.sourceCode, group)), group);

			expect(replacement?.text).toBe('export { a } from "./a";\nexport { b } from "./b";');
		});
	});
});
