import type { FunctionNode } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import { callbackFromArguments } from "./callback-from-arguments";
import { collectCalleeModifiers } from "./collect-callee-modifiers";
import { factoryFromCallee } from "./factory-from-callee";

export interface ParameterizedTest {
	callback: FunctionNode;
	describeCallee: string;
	extraSource: string;
	factoryName: "each" | "for";
	testCallee: string;
}

/**
 * The `.each` / `.for` call chain as a `describe` callee, an inner `it` /
 * `test` callee, and the callback that must move. `todo` and modifiers after
 * the factory are not an equivalent `describe` chain.
 */
export function parseParameterizedTest(source: string, testCall: ESTree.CallExpression): ParameterizedTest | null {
	const factory = factoryFromCallee(source, testCall.callee);
	if (factory === null) {
		return null;
	}

	const modifiers = collectCalleeModifiers(source, factory.rest);
	if (modifiers === null) {
		return null;
	}

	if (modifiers.rest.type !== "Identifier" || (modifiers.rest.name !== "it" && modifiers.rest.name !== "test")) {
		return null;
	}

	const callback = callbackFromArguments(source, testCall);
	if (callback === null) {
		return null;
	}

	return {
		callback: callback.node,
		describeCallee: `describe${modifiers.describeModifiers}${factory.factorySource}`,
		extraSource: callback.extraSource,
		factoryName: factory.factoryName,
		testCallee: `${modifiers.rest.name}${modifiers.testModifiers}`
	};
}
