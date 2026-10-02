import type { SourceFile } from "typescript";
import { isImportDeclaration, isNamedImports, isStringLiteral } from "typescript";

export interface ImportedBinding {
	imported: string;
	specifier: string;
}

export function importedBinding(source: SourceFile, name: string): ImportedBinding | null {
	for (const statement of source.statements) {
		if (!isImportDeclaration(statement) || !isStringLiteral(statement.moduleSpecifier)) {
			continue;
		}

		const clause = statement.importClause;
		if (!clause) {
			continue;
		}

		if (clause.name?.text === name) {
			return { imported: "default", specifier: statement.moduleSpecifier.text };
		}

		const named = clause.namedBindings;
		if (!named || !isNamedImports(named)) {
			continue;
		}

		for (const specifier of named.elements) {
			if (specifier.name.text !== name) {
				continue;
			}

			return {
				imported: specifier.propertyName?.text ?? specifier.name.text,
				specifier: statement.moduleSpecifier.text
			};
		}
	}

	return null;
}
