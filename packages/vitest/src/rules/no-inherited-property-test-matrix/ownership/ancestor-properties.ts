import { propertyName } from "@gabroberge/typescript-ast";
import type { ClassLikeDeclaration } from "typescript";
import {
	getCombinedModifierFlags,
	isConstructorDeclaration,
	isGetAccessor,
	isIdentifier,
	isIndexSignatureDeclaration,
	isMethodDeclaration,
	isPropertyDeclaration,
	isSetAccessor,
	ModifierFlags
} from "typescript";

import { isNonInstanceMember } from "./is-non-instance-member";

/**
 * Instance fields an ancestor can own, including constructor parameter
 * properties and accessors. Methods are ignored. An index signature or
 * computed name makes ownership unknown.
 */
export function ancestorProperties(node: ClassLikeDeclaration): Set<string> | null {
	const names = new Set<string>();

	for (const member of node.members) {
		if (isNonInstanceMember(member)) {
			continue;
		}

		if (isIndexSignatureDeclaration(member)) {
			return null;
		}

		if (isConstructorDeclaration(member)) {
			for (const parameter of member.parameters) {
				if ((getCombinedModifierFlags(parameter) & ModifierFlags.ParameterPropertyModifier) === 0) {
					continue;
				}

				if (!isIdentifier(parameter.name)) {
					return null;
				}

				names.add(parameter.name.text);
			}
			continue;
		}

		if (isMethodDeclaration(member)) {
			continue;
		}

		if (isGetAccessor(member) || isSetAccessor(member) || isPropertyDeclaration(member)) {
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
