import { describe, expect, it } from "vitest";

import { onlyElement } from "../testing/only-element";
import { hasInertKey } from "./has-inert-key";

describe(hasInertKey, () => {
	it.each([
		{ member: "value = 1;", name: "a plain name" },
		{ member: "#value = 1;", name: "a private name" },
		{ member: '["value"] = 1;', name: "a computed string" },
		{ member: "[1] = 1;", name: "a computed number" },
		{ member: "[KEY] = 1;", name: "a computed identifier" },
		{ member: "[Symbol.iterator](): void {}", name: "a well-known symbol" },
		{ member: "[keys.a.b] = 1;", name: "a static member chain" },
		{ member: "[`value`] = 1;", name: "a template without expressions" },
		{ member: "static {}", name: "a static block" },
		{ member: "[key: string]: unknown;", name: "an index signature" }
	])("should accept $name", ({ member }) => {
		expect.assertions(1);

		expect(hasInertKey(onlyElement(member))).toBe(true);
	});

	it.each([
		{ member: "[makeKey()] = 1;", name: "a call" },
		{ member: "[keys[index]] = 1;", name: "a computed member" },
		{ member: "[keys.list[0]] = 1;", name: "a computed member deeper in a chain" },
		{ member: "[`key${index}`] = 1;", name: "a template with expressions" },
		{ member: '["a" + "b"] = 1;', name: "a binary expression" },
		{ member: "[(index = 1)] = 1;", name: "an assignment" }
	])("should reject $name", ({ member }) => {
		expect.assertions(1);

		expect(hasInertKey(onlyElement(member))).toBe(false);
	});
});
