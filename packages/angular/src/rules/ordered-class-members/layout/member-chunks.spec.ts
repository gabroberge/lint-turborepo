import { describe, expect, it } from "vitest";

import { chunkTextsOf } from "../testing/chunk-texts-of";
import { chunksOf } from "../testing/chunks-of";
import { memberChunks } from "./member-chunks";

describe(memberChunks, () => {
	it("should return no chunks for an empty class", () => {
		expect.assertions(1);

		expect(chunksOf("class A {}\n")).toStrictEqual([]);
	});

	it("should slice each member with its indentation", () => {
		expect.assertions(2);

		const code = "class A {\n\ta = 1;\n\tb(): void {\n\t\treturn;\n\t}\n}\n";

		expect(chunkTextsOf(code)).toStrictEqual(["a = 1;", "b(): void {\n\t\treturn;\n\t}"]);
		expect(chunksOf(code)?.map((chunk) => chunk.indent)).toStrictEqual(["\t", "\t"]);
	});

	it("should attach leading line comments to the next member", () => {
		expect.assertions(1);

		const code = "class A {\n\ta = 1;\n\t// about b\n\t// more\n\tb = 2;\n}\n";

		expect(chunkTextsOf(code)).toStrictEqual(["a = 1;", "// about b\n\t// more\n\tb = 2;"]);
	});

	it("should attach a JSDoc block to the next member", () => {
		expect.assertions(1);

		const code = "class A {\n\t/**\n\t * Docs.\n\t */\n\ta = 1;\n\n\t/** B. */\n\tb = 2;\n}\n";

		expect(chunkTextsOf(code)).toStrictEqual(["/**\n\t * Docs.\n\t */\n\ta = 1;", "/** B. */\n\tb = 2;"]);
	});

	it("should attach same-line comments to the previous member", () => {
		expect.assertions(1);

		const code = "class A {\n\ta = 1; /* one */ // two\n\t// lead\n\tb = 2; // last\n}\n";

		expect(chunkTextsOf(code)).toStrictEqual(["a = 1; /* one */ // two", "// lead\n\tb = 2; // last"]);
	});

	it("should leave a comment on the opening brace line unowned", () => {
		expect.assertions(1);

		const code = "class A { // header\n\t// lead\n\ta = 1;\n}\n";

		expect(chunkTextsOf(code)).toStrictEqual(["// lead\n\ta = 1;"]);
	});

	it("should leave a dangling comment before the closing brace unowned", () => {
		expect.assertions(1);

		const code = "class A {\n\ta = 1;\n\t// dangling\n}\n";

		expect(chunkTextsOf(code)).toStrictEqual(["a = 1;"]);
	});

	it("should include decorators in the member chunk", () => {
		expect.assertions(1);

		const code = "class A {\n\t// lead\n\t@Input()\n\tvalue = 1;\n\n\t@Output() changed = 2;\n}\n";

		expect(chunkTextsOf(code)).toStrictEqual(["// lead\n\t@Input()\n\tvalue = 1;", "@Output() changed = 2;"]);
	});

	it("should count blank lines between chunks", () => {
		expect.assertions(1);

		const code = "class A {\n\n\ta = 1;\n\tb = 2;\n\n\tc = 3;\n\n\n\td = 4;\n}\n";

		expect(chunksOf(code)?.map((chunk) => chunk.blankLinesBefore)).toStrictEqual([0, 0, 1, 2]);
	});

	it("should count whitespace-only lines as blank", () => {
		expect.assertions(1);

		const code = "class A {\r\n\ta = 1;\r\n\t\r\n\tb = 2;\r\n}\r\n";

		expect(chunksOf(code)?.map((chunk) => chunk.blankLinesBefore)).toStrictEqual([0, 1]);
	});

	it("should return null when two members share a line", () => {
		expect.assertions(1);

		expect(chunksOf("class A {\n\ta = 1; b = 2;\n}\n")).toBeNull();
	});

	it("should return null when a member starts on the opening brace line", () => {
		expect.assertions(1);

		expect(chunksOf("class A { a = 1;\n\tb = 2;\n}\n")).toBeNull();
	});

	it("should return null when a trailing block comment ends on the next member line", () => {
		expect.assertions(1);

		expect(chunksOf("class A {\n\ta = 1; /* x\n\t*/ b = 2;\n}\n")).toBeNull();
	});

	it("should return null when a stray semicolon separates members", () => {
		expect.assertions(1);

		expect(chunksOf("class A {\n\ta(): void {}\n\t;\n\tb = 2;\n}\n")).toBeNull();
	});
});
