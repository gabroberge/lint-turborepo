import { comparePaths } from "./compare-paths";

export function leastSpecificPath(paths: readonly string[]): string {
	const [first, ...rest] = paths;
	if (first === undefined) {
		throw new Error("leastSpecificPath: path list is empty");
	}

	let least = first;
	for (const path of rest) {
		if (comparePaths(path, least) > 0) {
			least = path;
		}
	}

	return least;
}
