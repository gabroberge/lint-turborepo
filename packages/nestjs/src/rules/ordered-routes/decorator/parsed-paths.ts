export type ParsedPaths = { type: "dynamic" } | { type: "static"; paths: string[] };

export function parsedPaths(paths: string[] | null): ParsedPaths {
	if (paths === null) {
		return { type: "dynamic" };
	}

	return { paths, type: "static" };
}
