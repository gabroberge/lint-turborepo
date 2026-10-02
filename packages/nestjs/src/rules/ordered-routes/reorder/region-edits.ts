import type { Handler } from "../handler/handler";

export interface TextEdit {
	range: [number, number];
	text: string;
}

export function regionEdits(current: readonly Handler[], sorted: readonly Handler[]): TextEdit[] {
	const edits: TextEdit[] = [];

	for (const [position, handler] of current.entries()) {
		const next = sorted[position];
		if (next === undefined || next.text === handler.originalText) {
			continue;
		}

		edits.push({ range: handler.range, text: next.text });
	}

	return edits;
}
