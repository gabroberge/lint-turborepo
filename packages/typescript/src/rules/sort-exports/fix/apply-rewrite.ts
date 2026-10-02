import type { Replacement } from "./replace";

export interface RangeFixer<Fix> {
	replaceTextRange: (range: [number, number], text: string) => Fix;
}

export function applyRewrite<Fix>(fixer: RangeFixer<Fix>, replacement: Replacement | null): Fix | null {
	if (replacement === null) {
		return null;
	}

	return fixer.replaceTextRange(replacement.range, replacement.text);
}
