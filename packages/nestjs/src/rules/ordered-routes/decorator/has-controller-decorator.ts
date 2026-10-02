import { unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import type { Binding } from "../binding/binding-from-exported-name";
import { decoratorTarget } from "./decorator-target";
import { resolveDecorator } from "./resolve-decorator";

export function hasControllerDecorator(node: ESTree.Class, bindings: ReadonlyMap<string, Binding>): boolean {
	return node.decorators.some((decorator) => {
		const target = decoratorTarget(unwrapExpression(decorator.expression));
		return resolveDecorator(target, bindings)?.type === "controller";
	});
}
