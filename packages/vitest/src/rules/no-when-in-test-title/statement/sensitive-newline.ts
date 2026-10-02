import { traverse } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import type { TitleLiteral } from "../title/static-title";

export function hasBehaviorSensitiveNewline(root: ESTree.Node, source: string, titleLiteral: TitleLiteral): boolean {
	let found = false;
	traverse(root, (current) => {
		if (found || current === titleLiteral) {
			return "skip";
		}

		if (
			(current.type === "TemplateLiteral" || current.type === "JSXText") &&
			source.slice(current.range[0], current.range[1]).includes("\n")
		) {
			found = true;
			return "skip";
		}

		return undefined;
	});
	return found;
}
