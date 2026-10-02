export interface HandlerValues {
	method: string;
	originalText: string;
	path: string;
	range?: [number, number];
	unfixedArray?: boolean;
}

export function handlerValues(pathOrValues: HandlerValues | string): HandlerValues {
	if (typeof pathOrValues === "string") {
		return { method: "GET", originalText: pathOrValues, path: pathOrValues };
	}

	return pathOrValues;
}
