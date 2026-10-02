import type { FunctionNode } from "@gabroberge/oxlint-estree";

import { isToBeDefinedAssertion } from "./is-to-be-defined-assertion";
import { isToBeDefinedStatement } from "./is-to-be-defined-statement";

/**
 * A callback whose body is only `expect(value).toBeDefined()`. An empty body
 * is not wiring. Helpers are not inspected.
 */
export function isMinimalWiringBody(callback: FunctionNode): boolean {
	const body = callback.body;
	if (body === null) {
		return false;
	}

	if (body.type !== "BlockStatement") {
		return isToBeDefinedAssertion(body);
	}

	if (body.body.length === 0) {
		return false;
	}

	return body.body.every(isToBeDefinedStatement);
}
