import type { PropertyName } from "typescript";
import { isIdentifier, isNumericLiteral, isPrivateIdentifier, isStringLiteral } from "typescript";

export function propertyName(name: PropertyName): string | null {
	if (isIdentifier(name)) {
		return name.text;
	}

	if (isStringLiteral(name) || isNumericLiteral(name)) {
		return name.text;
	}

	if (isPrivateIdentifier(name)) {
		return null;
	}

	return "computed";
}
