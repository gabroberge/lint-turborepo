import { hasModifier, unwrapExpression } from "@gabroberge/typescript-ast";
import type { SourceFile } from "typescript";
import { isClassDeclaration, isClassExpression, isExportAssignment, isIdentifier, SyntaxKind } from "typescript";

import { locateClass } from "./locate-class";
import type { Located } from "./located";

export function exportedDefault(source: SourceFile, visited: Set<string>): Located | null {
	for (const statement of source.statements) {
		if (isClassDeclaration(statement) && hasModifier(statement, SyntaxKind.DefaultKeyword)) {
			return { displayName: statement.name?.text ?? "default", node: statement, source };
		}

		if (!isExportAssignment(statement) || statement.isExportEquals === true) {
			continue;
		}

		const expression = unwrapExpression(statement.expression);
		if (isIdentifier(expression)) {
			return locateClass(source, expression.text, visited);
		}

		if (isClassExpression(expression)) {
			return { displayName: expression.name?.text ?? "default", node: expression, source };
		}

		return null;
	}

	return null;
}
