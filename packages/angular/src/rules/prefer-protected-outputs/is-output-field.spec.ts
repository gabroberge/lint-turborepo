import { describe, expect, it } from "vitest";

import { call } from "../../testing/call";
import { identifier } from "../../testing/identifier";
import { propertyDefinition } from "../../testing/property-definition";
import { typeAnnotation } from "../../testing/type-annotation";
import { isOutputField } from "./is-output-field";

describe(isOutputField, () => {
	it("should recognize an output() initializer", () => {
		expect.assertions(1);

		expect(isOutputField(propertyDefinition({ value: call("output") }))).toBe(true);
	});

	it("should recognize an OutputEmitterRef annotation", () => {
		expect.assertions(1);

		expect(isOutputField(propertyDefinition({ typeAnnotation: typeAnnotation("OutputEmitterRef") }))).toBe(true);
	});

	it("should recognize a public output field", () => {
		expect.assertions(1);

		expect(isOutputField(propertyDefinition({ accessibility: "public", value: call("output") }))).toBe(true);
	});

	it("should reject a protected output field", () => {
		expect.assertions(1);

		expect(isOutputField(propertyDefinition({ accessibility: "protected", value: call("output") }))).toBe(false);
	});

	it("should reject an unrelated field", () => {
		expect.assertions(1);

		expect(isOutputField(propertyDefinition({ value: identifier("value") }))).toBe(false);
	});
});
