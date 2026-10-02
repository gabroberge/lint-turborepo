import type { PathElement } from "../path-array/static-path-elements";

export function element(path: string): PathElement {
	return {
		element: { name: path, type: "Identifier" } as PathElement["element"],
		path
	};
}
