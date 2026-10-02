/**
 * Express/Nest method dispatch: which HTTP methods can claim the same request.
 *
 * `@All()` matches every method. Express also dispatches HEAD to an earlier
 * GET, so GET and HEAD compete.
 */
export function methodsOverlap(left: string, right: string): boolean {
	if (left === right || left === "ALL" || right === "ALL") {
		return true;
	}

	return (left === "GET" && right === "HEAD") || (left === "HEAD" && right === "GET");
}
