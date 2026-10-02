import type { ESTree } from "@oxlint/plugins";

/** The body of the first top-level class of `ast`, declared or exported. */
export function firstClassBody(ast: ESTree.Program): ESTree.ClassBody {
	for (const statement of ast.body) {
		const declaration =
			statement.type === "ExportNamedDeclaration" || statement.type === "ExportDefaultDeclaration"
				? statement.declaration
				: statement;
		if (declaration?.type === "ClassDeclaration") {
			return declaration.body;
		}
	}

	throw new Error("Expected a class declaration");
}
