import { classFrom } from "@gabroberge/typescript-ast";
import { describe, expect, it } from "vitest";

import { leafProperties } from "./leaf-properties";

describe(leafProperties, () => {
	it("collects instance property names", () => {
		expect.assertions(1);

		expect([...(leafProperties(classFrom("class Derived { ownField?: number; }")) ?? [])]).toStrictEqual([
			"ownField"
		]);
	});

	it("is unknown when the class is decorated", () => {
		expect.assertions(1);

		expect(
			leafProperties(
				classFrom("function Extra(): ClassDecorator { return () => undefined; }\n@Extra() class Derived {}")
			)
		).toBeNull();
	});

	it("is unknown when the class has a constructor", () => {
		expect.assertions(1);

		expect(leafProperties(classFrom("class Derived { constructor() { super(); } ownField?: number; }"))).toBeNull();
	});

	it("is unknown when the class has a method", () => {
		expect.assertions(1);

		expect(
			leafProperties(classFrom('class Derived { ownField?: number; label(): string { return "derived"; } }'))
		).toBeNull();
	});

	it("is unknown when the class has an accessor", () => {
		expect.assertions(1);

		expect(leafProperties(classFrom("class Derived { get label(): string { return ''; } }"))).toBeNull();
	});

	it("is unknown when the class has an index signature", () => {
		expect.assertions(1);

		expect(leafProperties(classFrom("class Derived { ownField?: number; [key: string]: unknown; }"))).toBeNull();
	});

	it("is unknown when a property name is computed", () => {
		expect.assertions(1);

		expect(leafProperties(classFrom("class Derived { ['ownField']?: number; }"))).toBeNull();
	});
});
