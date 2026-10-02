import { angularApiOf } from "../angular/angular-api-of";
import { parseClass } from "./parse-class";

/** The Angular API called in the body of the arrow function the first field immediately invokes. */
export function innerApiOf(code: string): string | null {
	const { members, sourceCode } = parseClass(code);
	const node = members[0]?.node;
	const outer = node?.type === "PropertyDefinition" && node.value?.type === "CallExpression" ? node.value : null;
	const arrow = outer?.callee.type === "ArrowFunctionExpression" ? outer.callee : null;
	if (arrow?.body.type !== "CallExpression") {
		throw new Error("Expected an immediately invoked arrow function returning a call");
	}

	return angularApiOf(sourceCode, arrow.body.callee);
}
