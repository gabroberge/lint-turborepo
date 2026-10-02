import { describe, expect, it } from "vitest";

import { sourceFrom } from "./source-from";

describe(sourceFrom, () => {
	it("parses the snippet as a TypeScript source file", () => {
		expect.assertions(2);

		const source = sourceFrom("class Base { field?: number; }");

		expect(source.fileName).toBe("fixture.ts");
		expect(source.text).toBe("class Base { field?: number; }");
	});
});
