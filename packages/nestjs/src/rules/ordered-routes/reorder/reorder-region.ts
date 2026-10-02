import type { ESTree } from "@oxlint/plugins";

import type { Handler } from "../handler/handler";
import type { TextEdit } from "./region-edits";
import { regionEdits } from "./region-edits";
import { regionReportNode } from "./region-report-node";
import { sortHandlers } from "./sort-handlers";

export interface RouteRewrite {
	blockedByUnfixedArray: boolean;
	edits: TextEdit[];
	reportNode: ESTree.Node | null;
}

export function reorderRegion(handlers: readonly Handler[], methodOrder: readonly string[]): RouteRewrite {
	const sorted = sortHandlers(handlers, methodOrder);

	return {
		blockedByUnfixedArray: sorted.some((handler) => handler.unfixedArray),
		edits: regionEdits(handlers, sorted),
		reportNode: regionReportNode(handlers, sorted)
	};
}
