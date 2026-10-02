import type { ESTree } from "@oxlint/plugins";

import { isSignature } from "../member/is-signature";
import { memberKey } from "../member/member-key";
import { memberVisibility } from "../member/member-visibility";
import { parameterPropertyName } from "../member/parameter-property-name";
import type { ClassEntity, MemberEntity } from "../model/declaration";
import { addDeclaration } from "./add-declaration";
import { memberKindOf } from "./member-kind-of";
import { memberLabel } from "./member-label";
import type { ModelDraft } from "./model-draft";
import { valueOf } from "./value-of";

/** Declare every element of a module class's body, plus the constructor's parameter properties. */
export function collectClassMembers(draft: ModelDraft, entity: ClassEntity, body: ESTree.ClassBody): void {
	const className = entity.name ?? "default";
	for (const node of body.body) {
		const key = memberKey(node);
		const kind = memberKindOf(node);
		const isStatic = node.type === "StaticBlock" || node.static;
		const label = memberLabel(node, key);
		const hasValue =
			(node.type === "PropertyDefinition" || node.type === "AccessorProperty") && node.declare !== true;
		addDeclaration<MemberEntity>(draft, {
			class: entity.id,
			key,
			kind,
			name: key?.name ?? null,
			node,
			qualifiedName: `${className}.${label}`,
			reassigned: false,
			signature: isSignature(node),
			static: isStatic,
			value: hasValue ? valueOf(draft, node.value) : "none",
			visibility: memberVisibility(node)
		});

		if (node.type === "MethodDefinition" && node.kind === "constructor") {
			for (const parameter of node.value.params) {
				const name = parameterPropertyName(parameter);
				if (name === null || parameter.type !== "TSParameterProperty") {
					continue;
				}

				addDeclaration<MemberEntity>(draft, {
					class: entity.id,
					key: { name, private: false },
					kind: "parameter-property",
					name,
					node: parameter,
					qualifiedName: `${className}.${name}`,
					reassigned: false,
					signature: false,
					static: false,
					value: "other",
					visibility: parameter.accessibility ?? "public"
				});
			}
		}
	}
}
