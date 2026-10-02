import type { ControllerEntry } from "../handler/handler";
import { sortableRegions } from "../region/sortable-regions";
import type { TextEdit } from "./region-edits";
import type { RouteRewrite } from "./reorder-region";
import { reorderRegion } from "./reorder-region";

export function reorderController(entries: readonly ControllerEntry[], methodOrder: readonly string[]): RouteRewrite {
	const edits: TextEdit[] = [];
	let blockedByUnfixedArray = false;
	let reportNode: RouteRewrite["reportNode"] = null;

	for (const region of sortableRegions(entries)) {
		const rewrite = reorderRegion(region, methodOrder);
		blockedByUnfixedArray ||= rewrite.blockedByUnfixedArray;
		reportNode ??= rewrite.reportNode;
		edits.push(...rewrite.edits);
	}

	return { blockedByUnfixedArray, edits, reportNode };
}
