import { unwrapExpression } from "@gabroberge/oxlint-estree";
import type { CallAssumption } from "@gabroberge/typescript-class-analyzer";

import { angularAssumptions } from "../angular/angular-assumptions";
import { parseClass } from "./parse-class";

/** What `angularAssumptions` assumes about the call initializing the first field of `code`. */
export function assumptionOf(code: string): CallAssumption | null {
	const { members, sourceCode } = parseClass(code);
	const node = members[0]?.node;
	const call = node?.type === "PropertyDefinition" && node.value !== null ? unwrapExpression(node.value) : null;
	if (call?.type !== "CallExpression") {
		throw new Error("Expected a field initialized by a call");
	}

	return angularAssumptions(sourceCode).assumeCall(call);
}
