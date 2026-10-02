import { resolveVariable } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import type { ModelDraft } from "./model-draft";

/** Mark the declarations named by local `export { … }` lists and `export default name` as exported. */
export function markExported(draft: ModelDraft, program: ESTree.Program): void {
	for (const statement of program.body) {
		const locals =
			statement.type === "ExportNamedDeclaration" && statement.source === null
				? statement.specifiers.map((specifier) => specifier.local)
				: statement.type === "ExportDefaultDeclaration" && statement.declaration.type === "Identifier"
					? [statement.declaration]
					: [];
		for (const local of locals) {
			if (local.type !== "Identifier") {
				continue;
			}

			const variable = resolveVariable(draft.sourceCode, local);
			const id = variable === null ? undefined : draft.declarationByVariable.get(variable);
			const declaration = id === undefined ? undefined : draft.declarations.get(id);
			if (declaration !== undefined && "exported" in declaration) {
				declaration.exported = true;
			}
		}
	}
}
