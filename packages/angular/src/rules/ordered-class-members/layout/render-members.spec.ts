import { describe, expect, it } from "vitest";

import { renderClass } from "../testing/render-class";
import { renderMembers } from "./render-members";

describe(renderMembers, () => {
	it("should reorder members without blank lines", () => {
		expect.assertions(1);

		const code = "class A {\n\ta = 1;\n\n\tb = 2;\n\tc = 3;\n}\n";

		expect(renderClass(code, [2, 0, 1], [false, false, false])).toBe(
			"class A {\n\tc = 3;\n\ta = 1;\n\tb = 2;\n}\n"
		);
	});

	it("should insert blank lines where requested", () => {
		expect.assertions(1);

		const code = "class A {\n\ta = 1;\n\tb = 2;\n\tc = 3;\n}\n";

		expect(renderClass(code, [1, 0, 2], [false, true, true])).toBe(
			"class A {\n\tb = 2;\n\n\ta = 1;\n\n\tc = 3;\n}\n"
		);
	});

	it("should move multi-line members with their comments and decorators", () => {
		expect.assertions(1);

		const code = [
			"class A {",
			"\t/** Run. */",
			"\trun(): void {",
			"\t\treturn;",
			"\t}",
			"",
			"\t@Input() // input",
			"\tvalue = 1; // trailing",
			"}",
			""
		].join("\n");
		const expected = [
			"class A {",
			"\t@Input() // input",
			"\tvalue = 1; // trailing",
			"",
			"\t/** Run. */",
			"\trun(): void {",
			"\t\treturn;",
			"\t}",
			"}",
			""
		].join("\n");

		expect(renderClass(code, [1, 0], [false, true])).toBe(expected);
	});

	it("should keep the identity order unchanged", () => {
		expect.assertions(1);

		const code = "class A {\n\ta = 1;\n\n\tb = 2;\n}\n";

		expect(renderClass(code, [0, 1], [false, true])).toBe(code);
	});

	it("should use CRLF line breaks when the source does", () => {
		expect.assertions(1);

		const code = "class A {\r\n\ta = 1;\r\n\tb = 2;\r\n}\r\n";

		expect(renderClass(code, [1, 0], [false, true])).toBe("class A {\r\n\tb = 2;\r\n\r\n\ta = 1;\r\n}\r\n");
	});
});
