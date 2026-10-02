import type { ClassDeclaration } from "typescript";

import { sourceFrom } from "../source/source-from";
import { classDeclarationOf } from "./class-declaration-of";

export function classFrom(code: string): ClassDeclaration {
	const declaration = classDeclarationOf(sourceFrom(code));
	if (declaration === null) {
		throw new Error("classFrom: expected a class declaration");
	}

	return declaration;
}
