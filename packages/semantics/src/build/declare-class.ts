import type { ESTree, Variable } from "@oxlint/plugins";

import type { ClassEntity } from "../model/declaration";
import { addDeclaration } from "./add-declaration";
import { collectClassMembers } from "./collect-class-members";
import type { ModelDraft } from "./model-draft";

/** Declare a module class and its members, and index it by node and by the module binding naming it. */
export function declareClass(
	draft: ModelDraft,
	node: ESTree.Class,
	name: string | null,
	variable: Variable | undefined,
	exported: boolean
): ClassEntity {
	const entity = addDeclaration<ClassEntity>(draft, {
		exported,
		kind: "class",
		name,
		node,
		qualifiedName: name ?? "default"
	});
	draft.classByNode.set(node, entity.id);
	draft.boundaries.add(node);
	if (variable !== undefined) {
		draft.classByVariable.set(variable, entity.id);
	}

	collectClassMembers(draft, entity, node.body);
	return entity;
}
