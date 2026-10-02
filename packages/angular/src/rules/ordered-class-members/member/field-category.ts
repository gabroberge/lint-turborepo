import { unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree, SourceCode } from "@oxlint/plugins";

import { angularApiOf } from "../angular/angular-api-of";
import { CATEGORY_BY_API } from "../angular/angular-apis";
import type { Category } from "../options/categories";

/** The category of an instance field: the Angular API that initializes it, else `property`. */
export function fieldCategory(sourceCode: SourceCode, value: ESTree.Expression | null): Category {
	if (value === null) {
		return "property";
	}

	const expression = unwrapExpression(value);
	if (expression.type !== "CallExpression") {
		return "property";
	}

	const api = angularApiOf(sourceCode, expression.callee);
	return (api === null ? undefined : CATEGORY_BY_API.get(api)) ?? "property";
}
