import type { ESTree } from "@oxlint/plugins";

import type { Handler } from "../handler/handler";

export function regionReportNode(current: readonly Handler[], sorted: readonly Handler[]): ESTree.Node | null {
	let reportNode: ESTree.Node | null = null;

	for (const [position, handler] of current.entries()) {
		const next = sorted[position];
		if (next === undefined) {
			continue;
		}

		if (next.unfixedArray) {
			reportNode ??= next.reportNode;
		}

		if (next.text === handler.originalText) {
			continue;
		}

		reportNode ??= handler.reportNode;
	}

	return reportNode;
}
