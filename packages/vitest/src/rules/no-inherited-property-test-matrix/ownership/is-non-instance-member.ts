import { isStatic } from "@gabroberge/typescript-ast";
import type { ClassElement } from "typescript";
import { isClassStaticBlockDeclaration, isSemicolonClassElement } from "typescript";

/** Static members, static blocks, and empty elements do not declare instance properties. */
export function isNonInstanceMember(member: ClassElement): boolean {
	return isSemicolonClassElement(member) || isClassStaticBlockDeclaration(member) || isStatic(member);
}
