import { isExported, unwrapExpression } from "@gabroberge/typescript-ast";
import type { SourceFile } from "typescript";
import { isClassDeclaration, isClassExpression, isIdentifier, isVariableStatement } from "typescript";

import { exportedDefault } from "./exported-default";
import { followReexport } from "./follow-reexport";
import type { Located } from "./located";
import { markVisit } from "./mark-visit";

/**
 * The class bound to an export name in this file, including a default export
 * and a named re-export. Package and unresolved exports are not assumed.
 */
export function exportedClass(source: SourceFile, exportName: string, visited: Set<string>): Located | null {
	if (!markVisit(visited, "export", source.fileName, exportName)) {
		return null;
	}

	if (exportName === "default") {
		return exportedDefault(source, visited);
	}

	for (const statement of source.statements) {
		if (isClassDeclaration(statement) && statement.name?.text === exportName && isExported(statement)) {
			return { displayName: statement.name.text, node: statement, source };
		}

		if (!isVariableStatement(statement) || !isExported(statement)) {
			continue;
		}

		for (const declaration of statement.declarationList.declarations) {
			if (!isIdentifier(declaration.name) || declaration.name.text !== exportName || !declaration.initializer) {
				continue;
			}

			const expression = unwrapExpression(declaration.initializer);
			if (!isClassExpression(expression)) {
				continue;
			}

			return { displayName: expression.name?.text ?? exportName, node: expression, source };
		}
	}

	return followReexport(source, exportName, visited);
}
