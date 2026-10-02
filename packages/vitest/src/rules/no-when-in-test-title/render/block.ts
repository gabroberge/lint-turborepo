import { commonIndent } from "./common-indent";
import { reindentLines } from "./reindent-lines";

/**
 * A `{ ... }` body, reindented so its contents sit at `contentIndent` and the
 * closing `}` at `closeIndent`. A single-line block keeps its interior as-is.
 */
export function renderBlock(bodySource: string, contentIndent: string, closeIndent: string): string | null {
	if (!bodySource.startsWith("{") || !bodySource.endsWith("}")) {
		return null;
	}

	const inner = bodySource.slice(1, -1);
	if (!inner.includes("\n")) {
		return `{${inner}}`;
	}

	let lines = inner.split("\n");
	if (lines[0] === "") {
		lines = lines.slice(1);
	}

	if (lines.length > 0 && lines[lines.length - 1]?.trim() === "") {
		lines = lines.slice(0, -1);
	}

	if (lines.every((line) => line.trim() === "")) {
		return "{}";
	}

	const rendered = reindentLines(lines, commonIndent(lines), contentIndent);
	if (rendered === null) {
		return null;
	}

	return `{\n${rendered.join("\n")}\n${closeIndent}}`;
}
