import type { ESTree } from "@oxlint/plugins";

import type { Binding } from "../binding/binding-from-exported-name";
import { httpRouteFromDecorator } from "../decorator/http-route-from-decorator";
import type { DecoratedRoute } from "./decorated-route";
import { decoratedRoute } from "./decorated-route";

export function httpRoutesOnMethod(
	node: ESTree.MethodDefinition,
	bindings: ReadonlyMap<string, Binding>
): DecoratedRoute[] {
	return node.decorators.flatMap((decorator) =>
		decoratedRoute(decorator, httpRouteFromDecorator(decorator, bindings))
	);
}
