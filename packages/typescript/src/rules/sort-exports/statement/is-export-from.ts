import type { ESTree } from "@oxlint/plugins";

export type ExportFrom =
	| ESTree.ExportAllDeclaration
	| (ESTree.ExportNamedDeclaration & { source: ESTree.StringLiteral });

export function isExportFrom(statement: ESTree.Statement): statement is ExportFrom {
	if (statement.type === "ExportAllDeclaration") {
		return true;
	}

	return statement.type === "ExportNamedDeclaration" && statement.source !== null;
}
