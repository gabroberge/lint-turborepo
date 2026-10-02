import type { ESTree } from "@oxlint/plugins";

import type { HttpRoute } from "../decorator/http-route-from-decorator";

export interface DecoratedRoute {
	decorator: ESTree.Decorator;
	route: HttpRoute;
}

export function decoratedRoute(decorator: ESTree.Decorator, route: HttpRoute | null): DecoratedRoute[] {
	if (route === null) {
		return [];
	}

	return [{ decorator, route }];
}
