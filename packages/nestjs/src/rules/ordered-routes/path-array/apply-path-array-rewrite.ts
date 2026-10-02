import type { PathArrayRewrite } from "./path-array-rewrite";

export function applyPathArrayRewrite(
	methodText: string,
	methodStart: number,
	rewrite: PathArrayRewrite | null
): string {
	if (rewrite === null || rewrite.kind === "blocked") {
		return methodText;
	}

	const start = rewrite.range[0] - methodStart;
	const end = rewrite.range[1] - methodStart;
	return methodText.slice(0, start) + rewrite.replacement + methodText.slice(end);
}
