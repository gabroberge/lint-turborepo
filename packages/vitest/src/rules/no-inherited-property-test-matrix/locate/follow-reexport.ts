import type { SourceFile } from "typescript";
import { isExportDeclaration, isNamedExports, isStringLiteral } from "typescript";

import { readSource } from "../source/read-source";
import { resolveModule } from "../source/resolve-module";
import { exportedClass } from "./exported-class";
import { locateClass } from "./locate-class";
import type { Located } from "./located";

/**
 * Follow a named re-export to the class it names. A relative `export { X } from`
 * is resolved in the other file; a local `export { X }` is looked up here.
 */
export function followReexport(source: SourceFile, exportName: string, visited: Set<string>): Located | null {
	for (const statement of source.statements) {
		if (!isExportDeclaration(statement) || !statement.exportClause || !isNamedExports(statement.exportClause)) {
			continue;
		}

		for (const specifier of statement.exportClause.elements) {
			if (specifier.name.text !== exportName) {
				continue;
			}

			const localName = specifier.propertyName?.text ?? specifier.name.text;
			if (statement.moduleSpecifier && isStringLiteral(statement.moduleSpecifier)) {
				const resolved = resolveModule(source.fileName, statement.moduleSpecifier.text);
				if (resolved === null) {
					return null;
				}

				const other = readSource(resolved);
				if (other === null) {
					return null;
				}

				return exportedClass(other, localName, visited);
			}

			return locateClass(source, localName, visited);
		}
	}

	return null;
}
