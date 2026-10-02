import type { SourceFile } from "typescript";

import { readSource } from "../source/read-source";
import { resolveModule } from "../source/resolve-module";
import { bindingCount } from "./binding-count";
import { declaredClass } from "./declared-class";
import { exportedClass } from "./exported-class";
import { importedBinding } from "./imported-binding";
import type { Located } from "./located";
import { markVisit } from "./mark-visit";

/**
 * The class bound to `name` in this file: a declaration, a const class
 * expression, or a relative import of an exported class. A name with more
 * than one binding is unknown.
 */
export function locateClass(source: SourceFile, name: string, visited: Set<string>): Located | null {
	if (!markVisit(visited, "local", source.fileName, name)) {
		return null;
	}

	if (bindingCount(source, name) > 1) {
		return null;
	}

	const declared = declaredClass(source, name);
	if (declared !== null) {
		return declared;
	}

	const imported = importedBinding(source, name);
	if (imported === null) {
		return null;
	}

	const resolved = resolveModule(source.fileName, imported.specifier);
	if (resolved === null) {
		return null;
	}

	const other = readSource(resolved);
	if (other === null) {
		return null;
	}

	return exportedClass(other, imported.imported, visited);
}
