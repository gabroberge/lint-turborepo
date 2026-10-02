import type { IsolatedCoverage } from "../observe/isolated-coverage";
import type { OwnershipResolver } from "../ownership/resolver";

export function resolvedAssertions(coverage: IsolatedCoverage, resolver: OwnershipResolver): string[] {
	const names: string[] = [];

	for (const name of coverage.asserted) {
		if (resolver.ownership(name) !== null && !names.includes(name)) {
			names.push(name);
		}
	}

	return names;
}
