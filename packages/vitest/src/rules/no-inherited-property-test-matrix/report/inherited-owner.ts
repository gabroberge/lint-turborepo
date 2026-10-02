import type { ClassOwnership } from "../ownership/leaf-ownership";

/**
 * The declaring type of a property on a subclass. Own fields, a class that
 * does not extend, and an unknown map are not inherited coverage.
 */
export function inheritedOwner(ownership: ClassOwnership | null, property: string): string | null {
	if (ownership?.extends !== true) {
		return null;
	}

	const owner = ownership.properties.get(property);
	if (owner === undefined || owner === ownership.className) {
		return null;
	}

	return owner;
}
