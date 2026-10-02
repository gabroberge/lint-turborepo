import { propertyName } from "@gabroberge/typescript-ast";
import type { ClassLikeDeclaration } from "typescript";
import {
	getDecorators,
	isConstructorDeclaration,
	isGetAccessor,
	isIndexSignatureDeclaration,
	isMethodDeclaration,
	isPropertyDeclaration,
	isSetAccessor
} from "typescript";

import { isNonInstanceMember } from "./is-non-instance-member";

/**
 * Instance fields declared on a subclass. A class decorator, constructor,
 * method, accessor, index signature, or computed name makes ownership unknown.
 */
export function leafProperties(node: ClassLikeDeclaration): Set<string> | null {
	if ((getDecorators(node)?.length ?? 0) > 0) {
		return null;
	}

	const names = new Set<string>();
	for (const member of node.members) {
		if (isNonInstanceMember(member)) {
			continue;
		}

		if (
			isConstructorDeclaration(member) ||
			isGetAccessor(member) ||
			isIndexSignatureDeclaration(member) ||
			isMethodDeclaration(member) ||
			isSetAccessor(member)
		) {
			return null;
		}

		if (isPropertyDeclaration(member)) {
			const property = propertyName(member.name);
			if (property === "computed") {
				return null;
			}

			if (property !== null) {
				names.add(property);
			}

			continue;
		}

		return null;
	}

	return names;
}
