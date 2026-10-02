import type { FunctionNode } from "@gabroberge/oxlint-estree";

import { renderBlock } from "./block";
import { renderExpression } from "./expression";

/**
 * The moved inner `it` / `test` callback: same body and async/name, with
 * the parameter list that stays on the test.
 */
export function renderInnerFunction(
	source: string,
	callback: FunctionNode,
	innerParams: string,
	bodyIndent: string,
	closeIndent: string
): string | null {
	if (callback.body === null) {
		return null;
	}

	const bodySource = source.slice(callback.body.range[0], callback.body.range[1]);
	const asyncPrefix = callback.async ? "async " : "";

	if (callback.type === "ArrowFunctionExpression") {
		if (callback.expression) {
			const expression = renderExpression(bodySource, bodyIndent);
			if (expression === null) {
				return null;
			}

			return `${asyncPrefix}${innerParams} => ${expression}`;
		}

		const block = renderBlock(bodySource, bodyIndent, closeIndent);
		if (block === null) {
			return null;
		}

		return `${asyncPrefix}${innerParams} => ${block}`;
	}

	let name = "";
	if (callback.id !== null) {
		name = `${source.slice(callback.id.range[0], callback.id.range[1])} `;
	}

	const block = renderBlock(bodySource, bodyIndent, closeIndent);
	if (block === null) {
		return null;
	}

	return `${asyncPrefix}function ${name}${innerParams} ${block}`;
}
