import { describe, expect, it } from "vitest";

import { lines } from "./testing/lines";
import { lint } from "./testing/lint";

describe("sort-exports", () => {
	it("does not report source that already follows the module path", () => {
		expect.assertions(2);

		const code = lines(
			'export { endOf } from "./range/end-of";',
			'export type { Ranged } from "./range/ranged";',
			'export { startOf } from "./range/start-of";'
		);
		const result = lint(code);

		expect(result.messages).toStrictEqual([]);
		expect(result.output).toBe(code);
	});

	it("reports and fixes unsorted source", () => {
		expect.assertions(2);

		const result = lint(
			lines(
				'export { sameLiteral } from "./shape/same-literal";',
				'export { endOf } from "./range/end-of";',
				'export { startOf } from "./range/start-of";'
			)
		);

		expect(result.messages).toHaveLength(1);
		expect(result.output).toBe(
			lines(
				'export { endOf } from "./range/end-of";',
				'export { startOf } from "./range/start-of";',
				'export { sameLiteral } from "./shape/same-literal";'
			)
		);
	});

	it("reports a same-line comment without moving it", () => {
		expect.assertions(2);

		const code = lines('export { b } from "./b"; // b', 'export { a } from "./a";');
		const result = lint(code);

		expect(result.messages).toHaveLength(1);
		expect(result.output).toBe(code);
	});

	it("sorts groups on either side of a local export separately", () => {
		expect.assertions(2);

		const result = lint(
			lines(
				'export { z } from "./z";',
				'export { a } from "./a";',
				"export const local = 1;",
				'export { y } from "./y";',
				'export { b } from "./b";'
			)
		);

		expect(result.messages).toHaveLength(2);
		expect(result.output).toBe(
			lines(
				'export { a } from "./a";',
				'export { z } from "./z";',
				"export const local = 1;",
				'export { b } from "./b";',
				'export { y } from "./y";'
			)
		);
	});

	it("orders a type export by its module path", () => {
		expect.assertions(1);

		const result = lint(lines('export type { Zed } from "./z";', 'export { amy } from "./a";'));

		expect(result.output).toBe(lines('export { amy } from "./a";', 'export type { Zed } from "./z";'));
	});

	it("inverts a type export after a value export of the same module", () => {
		expect.assertions(2);

		const result = lint(
			lines(
				'export type { HttpMethod } from "./method/http-method";',
				'export { isHttpMethod } from "./method/http-method";'
			)
		);

		expect(result.messages).toHaveLength(1);
		expect(result.output).toBe(
			lines(
				'export { isHttpMethod } from "./method/http-method";',
				'export type { HttpMethod } from "./method/http-method";'
			)
		);
	});

	it("orders a star export by its module path", () => {
		expect.assertions(1);

		const result = lint(lines('export * from "./z";', 'export { a } from "./a";'));

		expect(result.output).toBe(lines('export { a } from "./a";', 'export * from "./z";'));
	});
});
