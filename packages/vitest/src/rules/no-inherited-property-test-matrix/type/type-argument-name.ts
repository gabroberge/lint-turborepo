import { typeReferenceName } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

/** The single type-argument identifier on a call, when the call has exactly one. */
export function typeArgumentName(call: ESTree.CallExpression): string | null {
	const typeArguments = call.typeArguments;
	if (typeArguments?.params.length !== 1) {
		return null;
	}

	const firstParameter = typeArguments.params[0];
	if (firstParameter === undefined) {
		return null;
	}

	return typeReferenceName(firstParameter);
}
