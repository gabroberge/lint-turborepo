import type { ESTree } from "@oxlint/plugins";

import type { EachRow } from "./each-row-of";
import { isInstantiation } from "./is-instantiation";
import { isolatedProperty } from "./isolated-property";
import { parseInstantiation } from "./parse-instantiation";

export interface IsolatedInstantiation {
	className: string | null;
	property: string;
}

/**
 * An instantiation that covers one property on its own and names at most one
 * class. A class/annotation mismatch or an input that is not a single key is
 * not isolated coverage.
 */
export function isolatedInstantiation(
	call: ESTree.CallExpression,
	annotation: string | null,
	eachRow: EachRow | null
): IsolatedInstantiation | null {
	if (!isInstantiation(call)) {
		return null;
	}

	const parsed = parseInstantiation(call);
	if (parsed === null) {
		return null;
	}

	let className = parsed.className;
	if (annotation !== null) {
		if (className !== null && className !== annotation) {
			return null;
		}

		className = annotation;
	}

	const property = isolatedProperty(parsed.input, eachRow);
	if (property === null) {
		return null;
	}

	return { className, property };
}
