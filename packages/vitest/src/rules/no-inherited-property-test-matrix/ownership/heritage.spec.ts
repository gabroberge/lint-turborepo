import { classFrom } from "@gabroberge/typescript-ast";
import { describe, expect, it } from "vitest";

import { heritageOf } from "./heritage";

describe(heritageOf, () => {
	it("is none when the class does not extend", () => {
		expect.assertions(1);

		expect(heritageOf(classFrom("class Base { inheritedField?: number; }"))).toStrictEqual({ kind: "none" });
	});

	it("is the parent name when the class extends a named class", () => {
		expect.assertions(1);

		expect(heritageOf(classFrom("class Derived extends Base { ownField?: number; }"))).toStrictEqual({
			kind: "name",
			name: "Base"
		});
	});

	it("is uncertain for mixin heritage", () => {
		expect.assertions(1);

		expect(heritageOf(classFrom("class Derived extends Mixin(Base) { ownField?: number; }"))).toStrictEqual({
			kind: "uncertain"
		});
	});
});
