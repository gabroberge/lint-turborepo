import { classFrom } from "@gabroberge/typescript-ast";
import { describe, expect, it } from "vitest";

import { ancestorProperties } from "./ancestor-properties";

describe(ancestorProperties, () => {
	it("collects instance property names", () => {
		expect.assertions(1);

		expect(ancestorProperties(classFrom("class Base { inheritedField?: number; }"))).toStrictEqual(
			new Set(["inheritedField"])
		);
	});

	it("collects constructor parameter properties", () => {
		expect.assertions(1);

		expect(
			ancestorProperties(classFrom("class Base { constructor(public inheritedField?: number) {} }"))
		).toStrictEqual(new Set(["inheritedField"]));
	});

	it("ignores methods and still collects properties", () => {
		expect.assertions(1);

		expect(
			ancestorProperties(classFrom('class Base { inheritedField?: number; label(): string { return "base"; } }'))
		).toStrictEqual(new Set(["inheritedField"]));
	});

	it("collects accessor names", () => {
		expect.assertions(1);

		expect(
			ancestorProperties(classFrom("class Base { get inheritedField(): number { return 1; } }"))
		).toStrictEqual(new Set(["inheritedField"]));
	});

	it("is unknown when the class has an index signature", () => {
		expect.assertions(1);

		expect(
			ancestorProperties(classFrom("class Base { inheritedField?: number; [key: string]: unknown; }"))
		).toBeNull();
	});

	it("still collects properties when the class is decorated", () => {
		expect.assertions(1);

		expect(
			ancestorProperties(
				classFrom(
					"function Extra(): ClassDecorator { return () => undefined; }\n@Extra() class Base { inheritedField?: number; }"
				)
			)
		).toStrictEqual(new Set(["inheritedField"]));
	});
});
