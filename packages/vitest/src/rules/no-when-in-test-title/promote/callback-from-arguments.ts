import { type FunctionNode, unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import { hasComment } from "../source/has-comment";

export interface TestCallbackSource {
	extraSource: string;
	node: FunctionNode;
}

/**
 * The callback written as the second argument of a titled test, plus any
 * trailing timeout source. Comments between the title and callback, or in
 * the extra argument, refuse the move.
 */
export function callbackFromArguments(source: string, testCall: ESTree.CallExpression): TestCallbackSource | null {
	const args = testCall.arguments;

	const titleArg = args[0];
	if (titleArg === undefined) {
		return null;
	}

	const callbackArg = args[1];
	if (callbackArg === undefined) {
		return null;
	}

	if (args.length < 2 || args.length > 3) {
		return null;
	}

	if (titleArg.type === "SpreadElement" || callbackArg.type === "SpreadElement") {
		return null;
	}

	if (hasComment(source.slice(titleArg.range[1], callbackArg.range[0]))) {
		return null;
	}

	const unwrapped = unwrapExpression(callbackArg);
	if (unwrapped.type !== "ArrowFunctionExpression" && unwrapped.type !== "FunctionExpression") {
		return null;
	}

	let extraSource = "";
	if (args.length === 3) {
		const extra = args[2];
		if (extra === undefined || extra.type === "SpreadElement") {
			return null;
		}

		extraSource = source.slice(callbackArg.range[1], extra.range[1]);
		if (hasComment(extraSource)) {
			return null;
		}
	}

	return { extraSource, node: unwrapped };
}
