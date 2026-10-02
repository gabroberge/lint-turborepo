import { unwrapExpression } from "@gabroberge/typescript-ast";
import type { SourceFile } from "typescript";
import {
	isClassDeclaration,
	isClassExpression,
	isIdentifier,
	isImportDeclaration,
	isNamedImports,
	isVariableStatement
} from "typescript";

/** Local class names and imported bindings that might resolve to a class. */
export function candidateNames(source: SourceFile): string[] {
	const names = new Set<string>();

	for (const statement of source.statements) {
		if (isClassDeclaration(statement) && statement.name) {
			names.add(statement.name.text);
		}

		if (isVariableStatement(statement)) {
			for (const declaration of statement.declarationList.declarations) {
				if (!isIdentifier(declaration.name) || !declaration.initializer) {
					continue;
				}

				if (isClassExpression(unwrapExpression(declaration.initializer))) {
					names.add(declaration.name.text);
				}
			}
		}

		if (!isImportDeclaration(statement) || !statement.importClause) {
			continue;
		}

		const clause = statement.importClause;
		if (clause.name) {
			names.add(clause.name.text);
		}

		const named = clause.namedBindings;
		if (named && isNamedImports(named)) {
			for (const specifier of named.elements) {
				names.add(specifier.name.text);
			}
		}
	}

	return [...names];
}
