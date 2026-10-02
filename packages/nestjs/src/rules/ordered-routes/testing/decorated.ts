import type { ESTree } from "@oxlint/plugins";

import type { DecoratedRoute } from "../handler/decorated-route";

export function decorated(decorator: ESTree.Decorator, route: DecoratedRoute["route"]): DecoratedRoute {
	return { decorator, route };
}
