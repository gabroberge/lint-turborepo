import { describe, expect, it } from "vitest";

import { lines } from "../testing/lines";
import type { MemberMetadata } from "../testing/member-metadata";
import { memberMetadata } from "../testing/member-metadata";
import { parseWithScope } from "../testing/parse-with-scope";
import { analyzeMembers } from "./analyze-members";

const PLAIN: MemberMetadata = { key: "x", overload: false, static: false, timeline: "instance", visibility: "public" };

describe(analyzeMembers, () => {
	it("should describe every element in source order", () => {
		expect.assertions(2);

		const { body } = parseWithScope(lines("class A {", "\ta = 1;", "\tm(): void {}", "\tstatic {}", "}"));
		const members = analyzeMembers(body);

		expect(members.map(({ index, key }) => [index, key])).toStrictEqual([
			[0, "a"],
			[1, "m"],
			[2, null]
		]);
		expect(members.map(({ node }) => node)).toStrictEqual(body.body);
	});

	it("should return no member for an empty class", () => {
		expect.assertions(1);

		expect(analyzeMembers(parseWithScope("class A {}\n").body)).toStrictEqual([]);
	});

	describe("keys", () => {
		it.each([
			{ expected: "x", member: "x = 1;", name: "an identifier" },
			{ expected: "#x", member: "#x = 1;", name: "a private name" },
			{ expected: "x y", member: "'x y' = 1;", name: "a string literal" },
			{ expected: "x", member: '["x"] = 1;', name: "a computed string literal" },
			{ expected: "1", member: "1 = 1;", name: "a numeric literal" },
			{ expected: "42", member: "[42] = 1;", name: "a computed numeric literal" },
			{ expected: "constructor", member: "constructor() {}", name: "a constructor" }
		])("should read the key of $name", ({ expected, member }) => {
			expect.assertions(1);

			expect(memberMetadata(member).key).toBe(expected);
		});

		it.each([
			{ member: "[KEY] = 1;", name: "a computed identifier" },
			{ member: "[Symbol.iterator](): void {}", name: "a computed symbol" },
			{ member: '["a" + "b"] = 1;', name: "a computed expression" },
			{ member: "static {}", name: "a static block" },
			{ member: "[key: string]: unknown;", name: "an index signature" }
		])("should have no key for $name", ({ member }) => {
			expect.assertions(1);

			expect(memberMetadata(member).key).toBeNull();
		});
	});

	describe("timelines", () => {
		it.each([
			{ expected: "instance", member: "x = 1;", name: "an instance field" },
			{ expected: "instance", member: "x?: number;", name: "an instance field without initializer" },
			{ expected: "instance", member: "accessor x = 1;", name: "an auto-accessor" },
			{ expected: "instance", member: "[KEY] = 1;", name: "a computed-key field" },
			{ expected: "static", member: "static x = 1;", name: "a static field" },
			{ expected: "static", member: "static accessor x = 1;", name: "a static auto-accessor" },
			{ expected: "static", member: "static {}", name: "a static block" }
		])("should place $name in the $expected timeline", ({ expected, member }) => {
			expect.assertions(1);

			expect(memberMetadata(member).timeline).toBe(expected);
		});

		it.each([
			{ member: "m(): void {}", name: "a method" },
			{ member: "static m(): void {}", name: "a static method" },
			{ member: "get x(): number {\n\t\treturn 1;\n\t}", name: "a getter" },
			{ member: "set x(value: number) {}", name: "a setter" },
			{ member: "constructor() {}", name: "a constructor" },
			{ member: "declare x: number;", name: "a declared field" },
			{ member: "static declare x: number;", name: "a declared static field" },
			{ member: "abstract x: number;", name: "an abstract field" },
			{ member: "abstract m(): void;", name: "an abstract method" },
			{ member: "abstract accessor x: number;", name: "an abstract auto-accessor" },
			{ member: "[key: string]: unknown;", name: "an index signature" },
			{ member: "static [key: string]: unknown;", name: "a static index signature" }
		])("should run nothing for $name", ({ member }) => {
			expect.assertions(1);

			expect(memberMetadata(member).timeline).toBeNull();
		});
	});

	describe("static", () => {
		it.each([
			{ expected: true, member: "static x = 1;", name: "a static field" },
			{ expected: true, member: "static m(): void {}", name: "a static method" },
			{ expected: true, member: "static [key: string]: unknown;", name: "a static index signature" },
			{ expected: false, member: "x = 1;", name: "an instance field" },
			{ expected: true, member: "static {}", name: "a static block" }
		])("should flag $name as static: $expected", ({ expected, member }) => {
			expect.assertions(1);

			expect(memberMetadata(member).static).toBe(expected);
		});
	});

	describe("overloads", () => {
		it("should flag a body-less signature as an overload", () => {
			expect.assertions(1);

			const { body } = parseWithScope(
				lines("class A {", "\tm(value: string): void;", "\tm(value: unknown): void {}", "}")
			);

			expect(analyzeMembers(body).map(({ key, overload }) => [key, overload])).toStrictEqual([
				["m", true],
				["m", false]
			]);
		});

		it("should not flag an abstract method as an overload", () => {
			expect.assertions(1);

			expect(memberMetadata("abstract m(): void;").overload).toBe(false);
		});
	});

	describe("visibility", () => {
		it.each([
			{ expected: "public", member: "x = 1;", name: "a member without keyword" },
			{ expected: "public", member: "public x = 1;", name: "a public member" },
			{ expected: "protected", member: "protected x = 1;", name: "a protected member" },
			{ expected: "private", member: "private x = 1;", name: "a private member" },
			{ expected: "private", member: "#x = 1;", name: "a private name" },
			{ expected: "private", member: "#m(): void {}", name: "a private-name method" },
			{ expected: "protected", member: "protected abstract m(): void;", name: "a protected abstract method" },
			{ expected: "public", member: "static {}", name: "a static block" },
			{ expected: "public", member: "[key: string]: unknown;", name: "an index signature" }
		])("should read $expected visibility of $name", ({ expected, member }) => {
			expect.assertions(1);

			expect(memberMetadata(member).visibility).toBe(expected);
		});
	});

	it("should describe a plain field completely", () => {
		expect.assertions(1);

		expect(memberMetadata("x = 1;")).toStrictEqual(PLAIN);
	});
});
