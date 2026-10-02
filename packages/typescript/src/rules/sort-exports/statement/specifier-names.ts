import type { ESTree } from "@oxlint/plugins";

import { nameOf } from "./name-of";

export function specifierNames(specifiers: readonly ESTree.ExportSpecifier[]): string[] {
	return specifiers.map((specifier) => nameOf(specifier.exported));
}
