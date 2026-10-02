import { compareRouteKeys } from "../compare/compare";
import type { RouteSortKey } from "../compare/route-sort-key";
import { resolveMethodOrder } from "../method/resolve-method-order";

export function order(keys: RouteSortKey[]): string[] {
	const methodOrder = resolveMethodOrder(undefined);

	return keys
		.toSorted((left, right) => compareRouteKeys(left, right, methodOrder))
		.map((key) => `${key.method} ${key.path}`);
}
