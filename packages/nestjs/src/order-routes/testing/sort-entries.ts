import { compareRouteKeys } from "../compare/compare";
import { resolveMethodOrder } from "../method/resolve-method-order";
import type { Entry } from "./entry";

export function sortEntries(entries: Entry[]): Entry[] {
	const methodOrder = resolveMethodOrder(undefined);

	return entries.toSorted((left, right) =>
		compareRouteKeys(
			{ method: left.method, path: left.path ?? "" },
			{ method: right.method, path: right.path ?? "" },
			methodOrder
		)
	);
}
