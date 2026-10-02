/**
 * When two competing methods can match the same request, Express swallows the
 * later one. A dedicated HEAD handler must be registered before GET, and a
 * concrete method before `@All()`.
 */
export function compareSwallowedMethod(left: string, right: string): number {
	const allDelta = Number(left === "ALL") - Number(right === "ALL");
	if (allDelta !== 0) {
		return allDelta;
	}

	if (left === "HEAD" && right === "GET") {
		return -1;
	}

	if (left === "GET" && right === "HEAD") {
		return 1;
	}

	return 0;
}
