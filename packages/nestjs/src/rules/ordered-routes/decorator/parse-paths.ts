import { staticString, unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import type { ParsedPaths } from "./parsed-paths";
import { parsedPaths } from "./parsed-paths";
import { staticPathStrings } from "./static-path-strings";

export function parsePaths(args: ESTree.Argument[]): ParsedPaths {
	const first = args[0];
	if (first === undefined) {
		return parsedPaths([""]);
	}

	const unwrapped = unwrapExpression(first as ESTree.Expression);
	if (unwrapped.type === "ArrayExpression") {
		return parsedPaths(staticPathStrings(unwrapped));
	}

	const path = staticString(unwrapped);
	if (path === null) {
		return parsedPaths(null);
	}

	return parsedPaths([path]);
}
