import type { ESTree } from "@oxlint/plugins";

import type { ClassEntity, MemberEntity } from "../model/declaration";
import type { Unit } from "../model/unit";
import { memberTarget } from "../resolve/member-target";
import { walkCode } from "../walk/walk-code";
import { walkFunctionUnit } from "../walk/walk-function-unit";
import { addUnit } from "./add-unit";
import { definitionCode } from "./definition-code";
import type { ModelDraft } from "./model-draft";

/**
 * Build the units of a module class: one for the code evaluated when the
 * class is defined (decorators, computed keys, `extends`), and one per
 * member with code (field initializers, static blocks, the constructor,
 * methods and accessors).
 */
export function buildClassUnits(draft: ModelDraft, entity: ClassEntity, node: ESTree.Class, parent: Unit): void {
	buildDefinitionUnit(draft, entity, node, parent);
	for (const member of draft.membersByClass.get(entity.id) ?? []) {
		if (member.kind !== "parameter-property") {
			buildMemberUnit(draft, member, entity, parent);
		}
	}
}

function buildDefinitionUnit(draft: ModelDraft, entity: ClassEntity, node: ESTree.Class, parent: Unit): void {
	const code = definitionCode(node);
	if (code.length === 0) {
		return;
	}

	const unit = addUnit(draft, {
		code,
		declaration: entity.id,
		kind: "class-definition",
		label: `${entity.qualifiedName} (definition)`,
		node,
		parent: parent.id,
		receiver: parent.receiver,
		trigger: "class-definition"
	});
	for (const root of code) {
		walkCode(draft, unit, root, "run");
	}
}

function buildMemberUnit(draft: ModelDraft, member: MemberEntity, entity: ClassEntity, parent: Unit): void {
	const node = member.node;
	const receiver = { class: entity.id, kind: member.static ? "class" : "instance" } as const;
	const base = { declaration: member.id, parent: parent.id, receiver };
	if (
		(node.type === "PropertyDefinition" || node.type === "AccessorProperty") &&
		node.value !== null &&
		node.declare !== true
	) {
		const unit = addUnit(draft, {
			...base,
			code: [node.value],
			kind: "field-initializer",
			label: `${member.qualifiedName} (initializer)`,
			node: node.value,
			trigger: member.static ? "class-definition" : "instance-construction"
		});
		walkCode(draft, unit, node.value, "store", member.id);
		if (member.key !== null) {
			// Once evaluated, the value is defined on the receiver under the field's key.
			unit.facts.push({
				kind: "access",
				mode: "write",
				node,
				target: memberTarget(draft, entity.id, member.key, member.static)
			});
		}
	} else if (node.type === "StaticBlock") {
		const unit = addUnit(draft, {
			...base,
			code: [node],
			kind: "static-block",
			label: member.qualifiedName,
			node,
			trigger: "class-definition"
		});
		for (const statement of node.body) {
			walkCode(draft, unit, statement, "run");
		}
	} else if (node.type === "MethodDefinition" && node.value.body !== null) {
		const kind =
			node.kind === "constructor"
				? "constructor"
				: node.kind === "get"
					? "getter"
					: node.kind === "set"
						? "setter"
						: "method";
		const unit = addUnit(draft, {
			...base,
			code: [node.value],
			kind,
			label:
				node.kind === "get" || node.kind === "set"
					? `${member.qualifiedName} (${node.kind})`
					: member.qualifiedName,
			node: node.value,
			trigger: kind === "constructor" ? "instance-construction" : "invocation"
		});
		if (kind === "constructor") {
			recordParameterProperties(draft, unit, entity);
		}

		walkFunctionUnit(draft, unit, node.value);
	}
}

/** A constructor assigns each parameter property before running its body. */
function recordParameterProperties(draft: ModelDraft, unit: Unit, entity: ClassEntity): void {
	for (const member of draft.membersByClass.get(entity.id) ?? []) {
		if (member.kind === "parameter-property" && member.key !== null) {
			const target = memberTarget(draft, entity.id, member.key, false);
			unit.facts.push({ kind: "access", mode: "write", node: member.node, target });
		}
	}
}
