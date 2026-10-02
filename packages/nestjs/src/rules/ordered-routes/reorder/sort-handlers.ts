import { compareRouteKeys } from "../../../order-routes";
import type { Handler } from "../handler/handler";

export function sortHandlers(handlers: readonly Handler[], methodOrder: readonly string[]): Handler[] {
	return handlers.toSorted((left, right) =>
		compareRouteKeys(
			{ method: left.method, path: left.path },
			{ method: right.method, path: right.path },
			methodOrder
		)
	);
}
