import type { FunctionNode } from "@gabroberge/oxlint-estree";

export interface ParameterLists {
	describeParams: string;
	innerParams: string;
}

/**
 * Parameter lists after a dataset moves to `describe`. `.each` takes every
 * parameter on the suite. `.for` takes only the row; later parameters stay
 * on the test because Vitest passes `TestContext` there.
 */
export function parameterLists(
	source: string,
	callback: FunctionNode,
	factoryName: "each" | "for"
): ParameterLists | null {
	if (callback.params.length === 0) {
		return { describeParams: "()", innerParams: "()" };
	}

	const firstParam = callback.params[0];
	if (firstParam === undefined) {
		return null;
	}

	const describeNodes = factoryName === "for" ? [firstParam] : callback.params;
	const innerNodes = factoryName === "for" && callback.params.length > 1 ? callback.params.slice(1) : [];

	const describeFirst = describeNodes[0];
	if (describeFirst === undefined) {
		return null;
	}

	const describeLast = describeNodes[describeNodes.length - 1];
	if (describeLast === undefined) {
		return null;
	}

	const describeParams = `(${source.slice(describeFirst.range[0], describeLast.range[1])})`;
	if (innerNodes.length === 0) {
		return { describeParams, innerParams: "()" };
	}

	const innerFirst = innerNodes[0];
	if (innerFirst === undefined) {
		return null;
	}

	const innerLast = innerNodes[innerNodes.length - 1];
	if (innerLast === undefined) {
		return null;
	}

	return {
		describeParams,
		innerParams: `(${source.slice(innerFirst.range[0], innerLast.range[1])})`
	};
}
