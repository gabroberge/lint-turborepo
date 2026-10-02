import { angularApiOf } from "../angular/angular-api-of";
import { parseClass } from "./parse-class";

/** The Angular API called by the initializer of the first field of `code`. */
export function apiOf(code: string): string | null {
	const { members, sourceCode } = parseClass(code);
	const node = members[0]?.node;
	if (node?.type !== "PropertyDefinition" || node.value?.type !== "CallExpression") {
		throw new Error("Expected a field initialized by a call");
	}

	return angularApiOf(sourceCode, node.value.callee);
}
