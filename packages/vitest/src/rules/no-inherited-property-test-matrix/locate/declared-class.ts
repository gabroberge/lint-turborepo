import { unwrapExpression } from "@gabroberge/typescript-ast";
import type { SourceFile } from "typescript";
import {
	getCombinedNodeFlags,
	isClassDeclaration,
	isClassExpression,
	isIdentifier,
	isVariableStatement,
	NodeFlags
} from "typescript";

import type { Located } from "./located";

export function declaredClass(source: SourceFile, name: string): Located | null {
	for (const statement of source.statements) {
		if (isClassDeclaration(statement) && statement.name?.text === name) {
			return { displayName: statement.name.text, node: statement, source };
		}

		if (!isVariableStatement(statement)) {
			continue;
		}

		if ((getCombinedNodeFlags(statement.declarationList) & NodeFlags.Const) === 0) {
			continue;
		}

		for (const declaration of statement.declarationList.declarations) {
			if (!isIdentifier(declaration.name) || declaration.name.text !== name || !declaration.initializer) {
				continue;
			}

			const expression = unwrapExpression(declaration.initializer);
			if (!isClassExpression(expression)) {
				return null;
			}

			return { displayName: expression.name?.text ?? name, node: expression, source };
		}
	}

	return null;
}
