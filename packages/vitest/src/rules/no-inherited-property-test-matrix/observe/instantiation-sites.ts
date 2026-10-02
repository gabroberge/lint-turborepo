import { isFunctionNode, traverse } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import { annotationOfInstantiation } from "./annotation-of-instantiation";
import { instanceOfClass } from "./instance-of";
import { isInstantiation } from "./is-instantiation";

export type InstantiationSite =
	| { kind: "annotated"; annotation: string; call: ESTree.CallExpression }
	| { kind: "asserted"; name: string }
	| { kind: "call"; call: ESTree.CallExpression };

/** Instantiation calls, typed initializers, and `toBeInstanceOf` names in a test body. Nested functions are skipped. */
export function instantiationSites(body: ESTree.Node): InstantiationSite[] {
	const sites: InstantiationSite[] = [];

	traverse(body, (node) => {
		if (isFunctionNode(node)) {
			return "skip";
		}

		const annotated = annotationOfInstantiation(node);
		if (annotated !== null) {
			sites.push({ annotation: annotated.annotation, call: annotated.call, kind: "annotated" });
			return "skip";
		}

		if (node.type !== "CallExpression") {
			return undefined;
		}

		const assertedClass = instanceOfClass(node);
		if (assertedClass !== null) {
			sites.push({ kind: "asserted", name: assertedClass });
			return undefined;
		}

		if (isInstantiation(node)) {
			sites.push({ call: node, kind: "call" });
		}

		return undefined;
	});

	return sites;
}
