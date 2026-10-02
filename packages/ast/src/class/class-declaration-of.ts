import type { ClassDeclaration, SourceFile } from "typescript";
import { isClassDeclaration } from "typescript";

export function classDeclarationOf(source: SourceFile): ClassDeclaration | null {
	return source.statements.find(isClassDeclaration) ?? null;
}
