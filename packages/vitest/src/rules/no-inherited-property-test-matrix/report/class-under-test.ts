import type { IsolatedCoverage } from "../observe/isolated-coverage";
import type { OwnershipResolver } from "../ownership/resolver";
import { resolvedAssertions } from "./resolved-assertions";

/**
 * The one resolved class this coverage names: an explicit instantiation
 * target, a resolved `toBeInstanceOf`, or the file's unique subclass.
 * Several named classes, or an unresolved explicit name, are left alone.
 */
export function classUnderTest(
	coverage: IsolatedCoverage,
	resolver: OwnershipResolver,
	fallback: string | null
): string | null {
	const explicit = [...coverage.classes];
	if (explicit.length > 1) {
		return null;
	}

	if (explicit.length === 1) {
		const name = explicit[0];
		if (name === undefined || resolver.ownership(name) === null) {
			return null;
		}

		const asserted = resolvedAssertions(coverage, resolver);
		if (asserted.length > 1) {
			return null;
		}

		const assertedName = asserted[0];
		if (asserted.length === 1 && assertedName !== undefined && assertedName !== name) {
			return null;
		}

		return name;
	}

	const asserted = resolvedAssertions(coverage, resolver);
	if (asserted.length > 1) {
		return null;
	}

	const onlyAsserted = asserted[0];
	if (asserted.length === 1 && onlyAsserted !== undefined) {
		return onlyAsserted;
	}

	return fallback;
}
