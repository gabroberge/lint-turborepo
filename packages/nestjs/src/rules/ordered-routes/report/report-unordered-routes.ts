import type { Context } from "@oxlint/plugins";

import type { RouteRewrite } from "../reorder/reorder-region";
import type { ControllerFrame } from "../walk/walk-state";

export function reportUnorderedRoutes(context: Context, controller: ControllerFrame, rewrite: RouteRewrite): void {
	if (rewrite.edits.length === 0 && !rewrite.blockedByUnfixedArray) {
		return;
	}

	const diagnostic = {
		data: { className: controller.node.id?.name ?? "controller" },
		messageId: "unordered",
		node: rewrite.reportNode ?? controller.node
	} as const;

	if (rewrite.edits.length === 0) {
		context.report(diagnostic);
		return;
	}

	context.report({
		...diagnostic,
		fix: (fixer) => rewrite.edits.map((edit) => fixer.replaceTextRange(edit.range, edit.text))
	});
}
