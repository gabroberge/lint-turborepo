import { describe, expect, it } from "vitest";

import { groupOf } from "../testing/group-of";
import { lines } from "../testing/lines";
import { parse } from "../testing/parse";
import { requireSource } from "../testing/require-source";
import { analyze } from "./analyze";
import { replace } from "./replace";

describe(analyze, () => {
	it("keeps a leading comment with the following statement", () => {
		expect.assertions(1);

		const parsed = parse(lines('export { b } from "./b";', "// keeps a", 'export { a } from "./a";'));
		const source = requireSource(analyze(parsed.sourceCode, groupOf(parsed.body)));

		expect(source.rest.map((item) => item.text)).toStrictEqual(['// keeps a\nexport { a } from "./a";']);
	});

	it("keeps a blank line at its source position", () => {
		expect.assertions(1);

		const parsed = parse(lines('export { b } from "./b";', "", 'export { a } from "./a";'));
		const source = requireSource(analyze(parsed.sourceCode, groupOf(parsed.body)));

		expect(source.rest.map((item) => item.separator)).toStrictEqual(["\n\n"]);
	});

	it("rejects a comment that shares a line with the previous statement", () => {
		expect.assertions(1);

		const parsed = parse(lines('export { b } from "./b"; // b', 'export { a } from "./a";'));

		expect(analyze(parsed.sourceCode, groupOf(parsed.body))).toBeNull();
	});
});

describe(replace, () => {
	it("builds a replacement after a successful analysis", () => {
		expect.assertions(1);

		const parsed = parse(lines('export { b } from "./b";', 'export { a } from "./a";'));
		const group = groupOf(parsed.body);
		const source = requireSource(analyze(parsed.sourceCode, group));

		expect(replace(source, group).text).toBe('export { a } from "./a";\nexport { b } from "./b";');
	});
});
