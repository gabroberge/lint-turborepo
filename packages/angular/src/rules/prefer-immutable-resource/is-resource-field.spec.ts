import { describe, expect, it } from "vitest";

import { call } from "../../testing/call";
import { identifier } from "../../testing/identifier";
import { member } from "../../testing/member";
import { parenthesized } from "../../testing/parenthesized";
import { parenthesizedTypeAnnotation } from "../../testing/parenthesized-type-annotation";
import { propertyDefinition } from "../../testing/property-definition";
import { typeAnnotation } from "../../testing/type-annotation";
import { isResourceField } from "./is-resource-field";

describe(isResourceField, () => {
	it("should recognize a resource() initializer", () => {
		expect.assertions(1);

		expect(isResourceField(propertyDefinition({ value: call("resource") }))).toBe(true);
	});

	it("should recognize an rxResource() initializer", () => {
		expect.assertions(1);

		expect(isResourceField(propertyDefinition({ value: call("rxResource") }))).toBe(true);
	});

	it("should unwrap a parenthesized resource() initializer", () => {
		expect.assertions(1);

		expect(isResourceField(propertyDefinition({ value: parenthesized(call("resource")) }))).toBe(true);
	});

	it("should recognize a ResourceRef annotation", () => {
		expect.assertions(1);

		expect(isResourceField(propertyDefinition({ typeAnnotation: typeAnnotation("ResourceRef") }))).toBe(true);
	});

	it("should unwrap a parenthesized ResourceRef annotation", () => {
		expect.assertions(1);

		expect(
			isResourceField(propertyDefinition({ typeAnnotation: parenthesizedTypeAnnotation("ResourceRef") }))
		).toBe(true);
	});

	it("should reject a readonly resource field", () => {
		expect.assertions(1);

		expect(isResourceField(propertyDefinition({ readonly: true, value: call("resource") }))).toBe(false);
	});

	it("should reject a member callee such as core.resource", () => {
		expect.assertions(1);

		expect(
			isResourceField(
				propertyDefinition({
					value: {
						...call("resource"),
						callee: member("core", "resource")
					}
				})
			)
		).toBe(false);
	});

	it("should reject an unrelated field", () => {
		expect.assertions(1);

		expect(isResourceField(propertyDefinition({ value: identifier("value") }))).toBe(false);
	});
});
