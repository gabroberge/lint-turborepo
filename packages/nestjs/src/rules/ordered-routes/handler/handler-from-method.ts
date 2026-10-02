import { endOf } from "@gabroberge/oxlint-estree";
import type { ESTree, SourceCode } from "@oxlint/plugins";

import { leastSpecificPath } from "../../../order-routes";
import type { Binding } from "../binding/binding-from-exported-name";
import { applyPathArrayRewrite } from "../path-array/apply-path-array-rewrite";
import { pathArrayRewrite } from "../path-array/path-array-rewrite";
import type { ControllerEntry } from "./handler";
import { httpRoutesOnMethod } from "./http-routes-on-method";
import { isInstanceMethod } from "./is-instance-method";
import { movableHttpRoute } from "./movable-http-route";
import { ownedStart } from "./owned-start";

export function handlerFromMethod(
	node: ESTree.MethodDefinition,
	bindings: ReadonlyMap<string, Binding>,
	source: SourceCode
): ControllerEntry | null {
	if (!isInstanceMethod(node)) {
		return null;
	}

	const routes = httpRoutesOnMethod(node, bindings);
	if (routes.length === 0) {
		return null;
	}

	const route = movableHttpRoute(routes);
	if (route === null) {
		return { kind: "barrier" };
	}

	const fileText = source.getText();
	const rewrite = pathArrayRewrite(route.decorator, fileText, source);
	const start = ownedStart(source, node);
	const originalText = fileText.slice(start, endOf(node));

	return {
		kind: "handler",
		method: route.method,
		originalText,
		path: leastSpecificPath(route.paths),
		range: [start, endOf(node)],
		reportNode: route.decorator,
		text: applyPathArrayRewrite(originalText, start, rewrite),
		unfixedArray: rewrite?.kind === "blocked"
	};
}
