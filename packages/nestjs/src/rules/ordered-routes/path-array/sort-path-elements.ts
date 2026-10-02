import { comparePaths } from "../../../order-routes";
import type { PathElement } from "./static-path-elements";

export function sortPathElements(elements: readonly PathElement[]): PathElement[] {
	return elements.toSorted((left, right) => comparePaths(left.path, right.path));
}
