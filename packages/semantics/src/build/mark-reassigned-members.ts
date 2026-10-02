import { resolveVariable, traverse, unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import { sameKey } from "../member/same-key";
import type { DeclarationId } from "../model/ids";
import { accessKey } from "../walk/access-key";
import type { ModelDraft } from "./model-draft";

/** One side (instance or static) of a module class. */
interface ClassSide {
	class: DeclarationId;
	static: boolean;
}

/** A module class node, with its id. */
interface ModuleClass {
	id: DeclarationId;
	node: ESTree.Class;
}

/** Member kinds whose value an assignment replaces (assigning a getter's key runs its setter instead). */
const REPLACEABLE_KINDS: ReadonlySet<string> = new Set(["accessor-field", "field", "method", "parameter-property"]);

/**
 * Mark the members of module classes that are assigned outside their own
 * declaration: `this.key` assigned, updated or destructured into inside the
 * class body (on the side, static or instance, of the class element
 * containing it), and `ClassName.key` anywhere in the module. Nested
 * functions and classes are not told apart, so this may mark too much,
 * never too little, for the syntax it recognizes.
 */
export function markReassignedMembers(draft: ModelDraft, program: ESTree.Program): void {
	traverse(program, (node) => {
		for (const target of assignedMembers(node)) {
			markMember(draft, target);
		}

		return undefined;
	});
}

function assignedMembers(node: ESTree.Node): ESTree.MemberExpression[] {
	if (node.type === "AssignmentExpression") {
		return patternMembers(node.left);
	}

	if (node.type === "UpdateExpression") {
		return patternMembers(node.argument);
	}

	if (
		(node.type === "ForInStatement" || node.type === "ForOfStatement") &&
		node.left.type !== "VariableDeclaration"
	) {
		return patternMembers(node.left);
	}

	return [];
}

/** The class whose side `object` denotes, when it is `this` in a class body or a module class's name. */
function classSideOf(draft: ModelDraft, object: ESTree.Node): ClassSide | null {
	if (object.type === "Identifier") {
		const variable = resolveVariable(draft.sourceCode, object);
		const definition = variable?.defs[0];
		const id =
			variable === null
				? undefined
				: (draft.classByVariable.get(variable) ??
					(definition?.type === "ClassName" ? draft.classByNode.get(definition.node) : undefined));
		return id === undefined ? null : { class: id, static: true };
	}

	if (object.type !== "ThisExpression") {
		return null;
	}

	let innermost: ModuleClass | null = null;
	for (const [node, id] of draft.classByNode) {
		if (node.type !== "ClassDeclaration" && node.type !== "ClassExpression") {
			continue;
		}

		if (contains(node.body, object) && (innermost === null || node.range[0] > innermost.node.range[0])) {
			innermost = { id, node };
		}
	}

	const element = innermost?.node.body.body.find((candidate) => contains(candidate, object));
	if (innermost === null || element === undefined) {
		return null;
	}

	return { class: innermost.id, static: element.type === "StaticBlock" || element.static };
}

function contains(outer: ESTree.Node, inner: ESTree.Node): boolean {
	return inner.range[0] >= outer.range[0] && inner.range[1] <= outer.range[1];
}

function markMember(draft: ModelDraft, node: ESTree.MemberExpression): void {
	const key = accessKey(node);
	const side = key === null ? null : classSideOf(draft, unwrapExpression(node.object));
	if (key === null || side === null) {
		return;
	}

	for (const member of draft.membersByClass.get(side.class) ?? []) {
		if (
			member.key !== null &&
			sameKey(member.key, key) &&
			member.static === side.static &&
			REPLACEABLE_KINDS.has(member.kind)
		) {
			member.reassigned = true;
		}
	}
}

function patternMembers(node: ESTree.Node): ESTree.MemberExpression[] {
	const target = unwrapExpression(node);
	if (target.type === "MemberExpression") {
		return [target];
	}

	if (target.type === "AssignmentPattern") {
		return patternMembers(target.left);
	}

	if (target.type === "RestElement") {
		return patternMembers(target.argument);
	}

	if (target.type === "ArrayPattern") {
		return target.elements.flatMap((element) => (element === null ? [] : patternMembers(element)));
	}

	if (target.type === "ObjectPattern") {
		return target.properties.flatMap((property) =>
			patternMembers(property.type === "RestElement" ? property.argument : property.value)
		);
	}

	return [];
}
