import { exportedName, unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import type { FunctionEntity, ImportEntity, VariableEntity } from "../model/declaration";
import { isReassigned } from "../resolve/is-reassigned";
import { addDeclaration } from "./add-declaration";
import { declareClass } from "./declare-class";
import { markExported } from "./mark-exported";
import type { ModelDraft } from "./model-draft";
import { valueOf } from "./value-of";

/**
 * Declare everything the module declares at top level: imports, functions,
 * variables and classes (with their members). Local `export { … }` lists
 * mark the named declarations as exported. Re-exports from other modules,
 * enums and namespaces are not modelled.
 */
export function collectModuleDeclarations(draft: ModelDraft, program: ESTree.Program): void {
	for (const statement of program.body) {
		declareStatement(draft, statement, false);
	}

	markExported(draft, program);
}

function declareFunction(draft: ModelDraft, node: ESTree.Function, exported: boolean): void {
	const [variable] = draft.sourceCode.getDeclaredVariables(node);
	const name = node.id?.name ?? null;
	const entity = addDeclaration<FunctionEntity>(draft, {
		exported,
		kind: "function",
		name,
		node,
		qualifiedName: name ?? "default",
		reassigned: variable === undefined ? false : isReassigned(variable)
	});
	if (variable !== undefined) {
		draft.declarationByVariable.set(variable, entity.id);
	}
}

function declareImport(draft: ModelDraft, node: ESTree.ImportDeclaration): void {
	for (const specifier of node.specifiers) {
		const imported =
			specifier.type === "ImportDefaultSpecifier"
				? "default"
				: specifier.type === "ImportNamespaceSpecifier"
					? "*"
					: (exportedName(specifier.imported) ?? "default");
		const typeOnly =
			node.importKind === "type" || (specifier.type === "ImportSpecifier" && specifier.importKind === "type");
		const entity = addDeclaration<ImportEntity>(draft, {
			imported,
			kind: "import",
			name: specifier.local.name,
			node: specifier,
			qualifiedName: specifier.local.name,
			source: node.source.value,
			typeOnly
		});
		for (const variable of draft.sourceCode.getDeclaredVariables(specifier)) {
			draft.declarationByVariable.set(variable, entity.id);
		}
	}
}

function declareStatement(draft: ModelDraft, node: ESTree.Node, exported: boolean): void {
	if (node.type === "ImportDeclaration") {
		declareImport(draft, node);
	} else if (node.type === "FunctionDeclaration") {
		declareFunction(draft, node, exported);
	} else if (node.type === "ClassDeclaration") {
		const [variable] = draft.sourceCode.getDeclaredVariables(node);
		declareClass(draft, node, node.id?.name ?? null, variable, exported);
	} else if (node.type === "VariableDeclaration") {
		declareVariables(draft, node, exported);
	} else if (node.type === "ExportNamedDeclaration" && node.declaration !== null) {
		declareStatement(draft, node.declaration, true);
	} else if (node.type === "ExportDefaultDeclaration") {
		const declaration = node.declaration;
		if (declaration.type === "FunctionDeclaration" || declaration.type === "ClassDeclaration") {
			declareStatement(draft, declaration, true);
		}
	}
}

function declareVariables(draft: ModelDraft, node: ESTree.VariableDeclaration, exported: boolean): void {
	for (const declarator of node.declarations) {
		const plain = declarator.id.type === "Identifier";
		for (const variable of draft.sourceCode.getDeclaredVariables(declarator)) {
			const entity = addDeclaration<VariableEntity>(draft, {
				declarationKind: node.kind === "const" ? "const" : node.kind === "let" ? "let" : "var",
				exported,
				kind: "variable",
				name: variable.name,
				node: declarator,
				qualifiedName: variable.name,
				reassigned: isReassigned(variable),
				value: plain ? valueOf(draft, declarator.init) : "other"
			});
			draft.declarationByVariable.set(variable, entity.id);
			const init = declarator.init === null ? null : unwrapExpression(declarator.init);
			if (plain && init?.type === "ClassExpression") {
				declareClass(draft, init, variable.name, variable, exported);
			}
		}
	}
}
