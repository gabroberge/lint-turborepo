import type { FunctionNode } from "@gabroberge/oxlint-estree";

import type { RecognizedTest } from "../recognize/test";
import { annotationFromSite } from "./annotation-from-site";
import { eachRowOf } from "./each-row-of";
import { hasNestedInstantiation } from "./has-nested-instantiation";
import { instantiationSites } from "./instantiation-sites";
import { type IsolatedInstantiation, isolatedInstantiation } from "./isolated-instantiation";

export interface IsolatedCoverage {
	asserted: readonly string[];
	classes: readonly string[];
	property: string;
	test: RecognizedTest;
}

export function isolatedCoverage(test: RecognizedTest, testCallbacks: WeakSet<FunctionNode>): IsolatedCoverage | null {
	if (test.caseCount.kind === "unknown") {
		return null;
	}

	if (hasNestedInstantiation(test.body, testCallbacks)) {
		return null;
	}

	const instantiations: IsolatedInstantiation[] = [];
	const asserted = new Set<string>();
	const eachRow = eachRowOf(test);

	for (const site of instantiationSites(test.body)) {
		if (site.kind === "asserted") {
			asserted.add(site.name);
			continue;
		}

		const instantiation = isolatedInstantiation(site.call, annotationFromSite(site), eachRow);
		if (instantiation === null) {
			return null;
		}

		instantiations.push(instantiation);
	}

	const property = instantiations[0]?.property;
	if (property === undefined || instantiations.some((instantiation) => instantiation.property !== property)) {
		return null;
	}

	const classes = new Set<string>();
	for (const instantiation of instantiations) {
		if (instantiation.className !== null) {
			classes.add(instantiation.className);
		}
	}

	return {
		asserted: [...asserted],
		classes: [...classes],
		property,
		test
	};
}
