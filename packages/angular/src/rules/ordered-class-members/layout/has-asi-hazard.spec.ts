import { describe, expect, it } from "vitest";

import { asiHazardOf } from "../testing/asi-hazard-of";
import { hasAsiHazard } from "./has-asi-hazard";

describe(hasAsiHazard, () => {
	it("should detect a field without semicolon followed by a computed member", () => {
		expect.assertions(1);

		expect(asiHazardOf("class A {\n\t[key] = 1;\n\ta = 1\n}\n", [1, 0])).toBe(true);
	});

	it("should detect a field without semicolon followed by a generator method", () => {
		expect.assertions(1);

		expect(asiHazardOf("class A {\n\t*gen(): Generator {}\n\ta = 1\n}\n", [1, 0])).toBe(true);
	});

	it("should detect a bodiless method signature followed by a hazardous member", () => {
		expect.assertions(1);

		expect(asiHazardOf("abstract class A {\n\t[key] = 1;\n\tabstract run(): void\n}\n", [1, 0])).toBe(true);
	});

	it("should ignore fields terminated by a semicolon", () => {
		expect.assertions(1);

		expect(asiHazardOf("class A {\n\t[key] = 1;\n\ta = 1;\n}\n", [1, 0])).toBe(false);
	});

	it("should ignore methods with a body", () => {
		expect.assertions(1);

		expect(asiHazardOf("class A {\n\t[key] = 1;\n\trun(): void {}\n}\n", [1, 0])).toBe(false);
	});

	it("should ignore safe next members", () => {
		expect.assertions(1);

		expect(asiHazardOf("class A {\n\tb = 2;\n\ta = 1\n}\n", [1, 0])).toBe(false);
	});

	it("should ignore pairs that are not adjacent in the new order", () => {
		expect.assertions(1);

		expect(asiHazardOf("class A {\n\ta = 1\n\tb = 2;\n\t[key] = 3;\n}\n", [0, 1, 2])).toBe(false);
	});
});
