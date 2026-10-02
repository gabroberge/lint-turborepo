import { identifierName } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

export function isViOrJestIdentifier(node: ESTree.Node): boolean {
	const name = identifierName(node);
	return name === "vi" || name === "jest";
}
