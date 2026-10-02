import type { Node, SourceFile } from "typescript";
import {
	forEachChild,
	isBindingElement,
	isClassDeclaration,
	isEnumDeclaration,
	isFunctionDeclaration,
	isIdentifier,
	isImportClause,
	isImportSpecifier,
	isInterfaceDeclaration,
	isNamespaceImport,
	isParameter,
	isTypeAliasDeclaration,
	isVariableDeclaration
} from "typescript";

export function bindingCount(source: SourceFile, name: string): number {
	let count = 0;

	const visit = (node: Node): void => {
		if (isClassDeclaration(node) && node.name?.text === name) {
			count++;
		}

		if (isFunctionDeclaration(node) && node.name?.text === name) {
			count++;
		}

		if (isEnumDeclaration(node) && node.name.text === name) {
			count++;
		}

		if (isInterfaceDeclaration(node) && node.name.text === name) {
			count++;
		}

		if (isTypeAliasDeclaration(node) && node.name.text === name) {
			count++;
		}

		if (isVariableDeclaration(node) && isIdentifier(node.name) && node.name.text === name) {
			count++;
		}

		if (isBindingElement(node) && isIdentifier(node.name) && node.name.text === name) {
			count++;
		}

		if (isParameter(node) && isIdentifier(node.name) && node.name.text === name) {
			count++;
		}

		if (isImportClause(node) && node.name?.text === name) {
			count++;
		}

		if (isImportSpecifier(node) && node.name.text === name) {
			count++;
		}

		if (isNamespaceImport(node) && node.name.text === name) {
			count++;
		}

		forEachChild(node, visit);
	};

	visit(source);
	return count;
}
