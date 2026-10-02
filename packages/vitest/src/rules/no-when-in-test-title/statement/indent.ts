/**
 * Indent a statement as the first child of a new `describe`. The first line
 * sits at `baseIndent` plus one tab; later lines gain one tab and keep their
 * relative indent. Empty lines stay empty.
 */
export function indentStatement(statement: string, baseIndent: string): string {
	return statement
		.split("\n")
		.map((line, index) => {
			if (line.length === 0) {
				return line;
			}

			if (index === 0) {
				return `${baseIndent}\t${line}`;
			}

			return `\t${line}`;
		})
		.join("\n");
}
