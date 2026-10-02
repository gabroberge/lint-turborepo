import { describe, expect, it } from "vitest";

import { identifier } from "../testing/identifier";
import { member } from "../testing/member";
import { methodDefinition } from "../testing/method-definition";
import { propertyDefinition } from "../testing/property-definition";
import { staticBlock } from "../testing/static-block";
import { isStaticSpeciesMember } from "./is-static-member";

describe(isStaticSpeciesMember, () => {
	it("should recognize a static species getter", () => {
		expect.assertions(1);

		expect(
			isStaticSpeciesMember(
				methodDefinition({
					computed: true,
					key: member("Symbol", "species"),
					kind: "get",
					static: true
				})
			)
		).toBe(true);
	});

	it("should recognize a static species field", () => {
		expect.assertions(1);

		expect(
			isStaticSpeciesMember(
				propertyDefinition({
					computed: true,
					key: member("Symbol", "species"),
					static: true
				})
			)
		).toBe(true);
	});

	it("should reject an instance species getter", () => {
		expect.assertions(1);

		expect(
			isStaticSpeciesMember(
				methodDefinition({
					computed: true,
					key: member("Symbol", "species"),
					kind: "get"
				})
			)
		).toBe(false);
	});

	it("should reject a differently named computed member", () => {
		expect.assertions(1);

		expect(
			isStaticSpeciesMember(
				methodDefinition({
					computed: true,
					key: member("Symbol", "iterator"),
					kind: "get",
					static: true
				})
			)
		).toBe(false);
	});

	it("should reject a non-computed species identifier", () => {
		expect.assertions(1);

		expect(
			isStaticSpeciesMember(
				methodDefinition({
					key: identifier("species"),
					kind: "get",
					static: true
				})
			)
		).toBe(false);
	});

	it("should reject a static block", () => {
		expect.assertions(1);

		expect(isStaticSpeciesMember(staticBlock())).toBe(false);
	});
});
