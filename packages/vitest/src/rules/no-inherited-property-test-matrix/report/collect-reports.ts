import type { ESTree } from "@oxlint/plugins";

import type { IsolatedCoverage } from "../observe/isolated-coverage";
import type { OwnershipResolver } from "../ownership/resolver";
import { classUnderTest } from "./class-under-test";
import { inheritedOwner } from "./inherited-owner";

export interface Report {
	node: ESTree.CallExpression;
	owner: string;
	property: string;
}

export function collectReports(coverages: IsolatedCoverage[], resolver: OwnershipResolver): Report[] {
	const fallback = resolver.uniqueSubclass();
	const reports: Report[] = [];

	for (const coverage of coverages) {
		const className = classUnderTest(coverage, resolver, fallback);
		if (className === null) {
			continue;
		}

		const owner = inheritedOwner(resolver.ownership(className), coverage.property);
		if (owner === null) {
			continue;
		}

		reports.push({
			node: coverage.test.reportNode,
			owner,
			property: coverage.property
		});
	}

	return reports.toSorted((left, right) => left.node.range[0] - right.node.range[0]);
}
