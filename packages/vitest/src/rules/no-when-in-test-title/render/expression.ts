import { commonIndent } from "./common-indent";
import { reindentLines } from "./reindent-lines";

/**
 * An expression-bodied arrow callback. The first line stays as written;
 * later lines are reindented to `contentIndent`.
 */
export function renderExpression(expressionSource: string, contentIndent: string): string | null {
	const lines = expressionSource.split("\n");
	if (lines.length === 1) {
		return expressionSource;
	}

	const rest = reindentLines(lines.slice(1), commonIndent(lines.slice(1)), contentIndent);
	if (rest === null) {
		return null;
	}

	return [lines[0], ...rest].join("\n");
}
