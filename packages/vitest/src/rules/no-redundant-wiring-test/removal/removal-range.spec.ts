import { describe, expect, it } from "vitest";

import { statementCovering } from "../testing/statement-covering";
import { removalRange } from "./removal-range";

describe(removalRange, () => {
	it("should include indent, semicolon, and the terminating newline", () => {
		expect.assertions(1);

		const source = '\tit("x", () => {});\n';

		expect(removalRange(source, statementCovering(source, 'it("x", () => {})'))).toStrictEqual([0, source.length]);
	});

	it("should include leading line comments with no blank line", () => {
		expect.assertions(1);

		const source = '\t// Only checks construction.\n\tit("x", () => {});\n';

		expect(removalRange(source, statementCovering(source, 'it("x", () => {})'))).toStrictEqual([0, source.length]);
	});

	it("should stop leading comments at a blank line", () => {
		expect.assertions(1);

		const source = '\t// setup stays.\n\n\tit("x", () => {});\n';
		const statement = statementCovering(source, 'it("x", () => {})');
		const lineStart = source.lastIndexOf("\n", statement.range[0] - 1) + 1;

		expect(removalRange(source, statement)).toStrictEqual([lineStart, source.length]);
	});

	it("should include a full-line block comment", () => {
		expect.assertions(1);

		const source = '\t/* construction only */\n\tit("x", () => {});\n';

		expect(removalRange(source, statementCovering(source, 'it("x", () => {})'))).toStrictEqual([0, source.length]);
	});

	it("should reject a trailing comment on the same line", () => {
		expect.assertions(1);

		const source = '\tit("x", () => {}); // belongs beside the next test\n';

		expect(removalRange(source, statementCovering(source, 'it("x", () => {})'))).toBeNull();
	});

	it("should reject a multiline block comment above the statement", () => {
		expect.assertions(1);

		const source = '\t/*\n\t * construction only\n\t */\n\tit("x", () => {});\n';

		expect(removalRange(source, statementCovering(source, 'it("x", () => {})'))).toBeNull();
	});

	it("should reject another token before the statement on the same line", () => {
		expect.assertions(1);

		const source = 'const defined = it("x", () => {});\n';

		expect(removalRange(source, statementCovering(source, 'it("x", () => {})'))).toBeNull();
	});

	it("should reject another token after the statement on the same line", () => {
		expect.assertions(1);

		const source = 'it("a", () => {}); it("b", () => {});';

		expect(removalRange(source, statementCovering(source, 'it("a", () => {})'))).toBeNull();
	});

	it("should include a CRLF terminator", () => {
		expect.assertions(1);

		const source = '\tit("x", () => {});\r\n';

		expect(removalRange(source, statementCovering(source, 'it("x", () => {})'))).toStrictEqual([0, source.length]);
	});
});
