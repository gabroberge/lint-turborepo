import { identifierName, unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

/**
 * True for a computed key that is `Symbol.species`. Other well-known symbols
 * and a non-computed `species` identifier do not count.
 */
export function isSymbolSpeciesKey(node: ESTree.Node): boolean {
	const key = unwrapExpression(node);

	return (
		key.type === "MemberExpression" &&
		!key.computed &&
		!key.optional &&
		identifierName(key.object) === "Symbol" &&
		identifierName(key.property) === "species"
	);
}
