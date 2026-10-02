import type { ESTree } from "@oxlint/plugins";

import type { HttpMethod } from "../../../order-routes";
import type { DecoratedRoute } from "./decorated-route";

export interface MovableHttpRoute {
	decorator: ESTree.Decorator;
	method: HttpMethod;
	paths: string[];
}

/**
 * One method is one slot. Multiple HTTP decorators or a dynamic path cannot
 * be moved without splitting the method, so nearby handlers sort on either
 * side of it.
 */
export function movableHttpRoute(routes: readonly DecoratedRoute[]): MovableHttpRoute | null {
	const [route] = routes;
	if (route === undefined || routes.length !== 1 || route.route.paths.type === "dynamic") {
		return null;
	}

	return {
		decorator: route.decorator,
		method: route.route.method,
		paths: route.route.paths.paths
	};
}
