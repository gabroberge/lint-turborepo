import { unwrapExpression } from "@gabroberge/typescript-ast";
import type { ClassLikeDeclaration } from "typescript";
import { SyntaxKind, isIdentifier } from "typescript";

export type Heritage = { kind: "name"; name: string } | { kind: "none" } | { kind: "uncertain" };

/**
 * The class named by `extends`, when heritage is a single identifier.
 * Mixins, mapped types, and other dynamic heritage cannot be followed.
 */
export function heritageOf(node: ClassLikeDeclaration): Heritage {
	const clause = node.heritageClauses?.find((heritage) => heritage.token === SyntaxKind.ExtendsKeyword);
	if (!clause) {
		return { kind: "none" };
	}

	const extended = clause.types[0];
	if (clause.types.length !== 1 || extended === undefined) {
		return { kind: "uncertain" };
	}

	const expression = unwrapExpression(extended.expression);
	if (!isIdentifier(expression)) {
		return { kind: "uncertain" };
	}

	return { kind: "name", name: expression.text };
}
