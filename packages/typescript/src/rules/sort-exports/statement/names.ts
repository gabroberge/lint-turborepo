import type { ExportFrom } from "./is-export-from";
import { namesOfExported } from "./names-of-exported";
import { specifierNames } from "./specifier-names";

export function names(statement: ExportFrom): string[] {
	if (statement.type === "ExportAllDeclaration") {
		return namesOfExported(statement.exported);
	}

	return specifierNames(statement.specifiers);
}
