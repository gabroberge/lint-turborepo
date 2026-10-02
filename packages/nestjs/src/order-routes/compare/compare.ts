/**
 * Orders NestJS controller handlers the way Express actually matches them.
 *
 * At each segment, a path that has already ended comes first, then a literal,
 * then a parameter, then a wildcard. `@Get()` therefore comes before
 * `@Get("active")` and `@Get(":id")`, which is the order the Nest CRUD
 * generator emits. Those routes do not shadow each other. A wildcard still
 * comes last: on the Express 5 adapter shipped with Nest 12, `*path` and
 * `{*path}` require at least one segment, so they do not capture `@Get()`,
 * but they do capture a later static or parameter route.
 *
 * Literal text and parameter names are not compared. `:id` and `:slug` tie, and
 * `orders` vs `users` keeps source order.
 *
 * HTTP method order is the primary key only when the methods cannot match the
 * same request. `@All()` overlaps every method. Express also dispatches HEAD
 * requests to an earlier GET route, so GET and HEAD are compared by path
 * specificity too. When those overlapping patterns can match the same request
 * and specificity ties, a concrete method comes before `@All()`, and HEAD comes
 * before GET so a dedicated HEAD handler is not swallowed by GET. Distinct
 * literals such as `orders` and `users` do not match, so method order wins.
 *
 * Remaining ties return 0 so a stable sort keeps source order.
 */

import { methodsOverlap } from "../method/methods-overlap";
import { comparePaths } from "../path/compare-paths";
import { compareOverlappingTie } from "./compare-overlapping-tie";
import { methodRank } from "./method-rank";
import type { RouteSortKey } from "./route-sort-key";

export function compareRouteKeys(left: RouteSortKey, right: RouteSortKey, methodOrder: readonly string[]): number {
	if (methodsOverlap(left.method, right.method)) {
		const pathDelta = comparePaths(left.path, right.path);
		if (pathDelta !== 0) {
			return pathDelta;
		}

		return compareOverlappingTie(left, right, methodOrder);
	}

	const methodDelta = methodRank(left.method, methodOrder) - methodRank(right.method, methodOrder);
	if (methodDelta !== 0) {
		return methodDelta;
	}

	return comparePaths(left.path, right.path);
}
