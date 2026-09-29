import type { ESTree } from "@oxlint/plugins";

import { unwrapExpression } from "../unwrap/unwrap-expression";
import { sameLiteral } from "./same-literal";
import { sameMemberShape } from "./same-member-shape";

export function sameSafeShape(left: ESTree.Expression, right: ESTree.Expression): boolean {
	const a = unwrapExpression(left);
	const b = unwrapExpression(right);

	if (a.type === "Identifier" && b.type === "Identifier") {
		return a.name === b.name;
	}

	if (a.type === "Literal" && b.type === "Literal") {
		return sameLiteral(a, b);
	}

	if (a.type === "ThisExpression" && b.type === "ThisExpression") {
		return true;
	}

	if (a.type === "MemberExpression" && b.type === "MemberExpression") {
		return sameMemberShape(a, b);
	}

	return false;
}
