import type { FunctionNode } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import { isTestFactoryCall, testCallbackFromCall, testFunctionName } from "../../../test-call";
import { type CaseCount, caseCountOf } from "../each/case-count";

export interface RecognizedTest {
	body: NonNullable<FunctionNode["body"]>;
	callback: FunctionNode;
	caseCount: CaseCount;
	reportNode: ESTree.CallExpression;
}

export function recognizeTest(node: ESTree.CallExpression): RecognizedTest | null {
	if (isTestFactoryCall(node)) {
		return null;
	}

	if (testFunctionName(node.callee) === null) {
		return null;
	}

	const callback = testCallbackFromCall(node);
	if (callback?.body == null) {
		return null;
	}

	return {
		body: callback.body,
		callback,
		caseCount: caseCountOf(node),
		reportNode: node
	};
}
