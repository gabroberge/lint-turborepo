import type { Declaration } from "../model/declaration";
import type { ModelDraft } from "./model-draft";

type WithoutId<Entity> = Entity extends Declaration ? Omit<Entity, "id"> : never;

/** Register a declaration and give it the next id. Members are also indexed under their class. */
export function addDeclaration<Entity extends Declaration>(draft: ModelDraft, entity: WithoutId<Entity>): Entity {
	const declaration = { ...entity, id: `d${String(draft.declarations.size)}` } as unknown as Entity;
	draft.declarations.set(declaration.id, declaration);
	if (declaration.kind !== "class" && "class" in declaration) {
		const members = draft.membersByClass.get(declaration.class) ?? [];
		members.push(declaration);
		draft.membersByClass.set(declaration.class, members);
	}

	return declaration;
}
