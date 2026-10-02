import { describe, expect, it } from "vitest";

import { sourceFrom } from "../source/source-from";
import { classDeclarationOf } from "./class-declaration-of";

describe(classDeclarationOf, () => {
	it("returns the first class declaration", () => {
		expect.assertions(1);

		const source = sourceFrom("function extra(): void {}\nclass Base { field?: number; }");

		expect(classDeclarationOf(source)?.name?.text).toBe("Base");
	});

	it("is null when the source has no class declaration", () => {
		expect.assertions(1);

		expect(classDeclarationOf(sourceFrom("function extra(): void {}"))).toBeNull();
	});
});
