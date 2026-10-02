import type { ESTree } from "@oxlint/plugins";

import type { PathElement } from "../path-array/static-path-elements";

export function pathElement(path: string, start: number, end: number): PathElement {
	return {
		element: { range: [start, end], type: "Literal", value: path } as ESTree.StringLiteral,
		path
	};
}
