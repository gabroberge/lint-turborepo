import type { FunctionNode } from "@gabroberge/oxlint-estree";
import { isFunctionNode, unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import type { UnitTarget } from "../model/target";
import { resolveIdentifier } from "../resolve/resolve-identifier";
import { emitAccess } from "./emit-access";
import { emitUnknown } from "./emit-unknown";
import { isDirectEval } from "./is-direct-eval";
import { isFollowable } from "./is-followable";
import { isNamedReference } from "./is-named-reference";
import { visitFunctionLiteral } from "./visit-function-literal";
import { visitMember } from "./visit-member";
import type { Walker } from "./walker";

/**
 * A call or `new`.
 * - A call the assumptions describe produces no uncertainty; function
 *   literals passed to it are `passed-to-assumed`, and its callee is
 *   evaluated unless it is a plain name.
 * - `new` of a module class is a `construct` access of its binding; it runs
 *   code outside the model only through a parent constructor (`extends`).
 *   `new` of anything else runs code outside the model (`construct`).
 * - A member call, a call of a module binding, and an immediately invoked
 *   function literal are recorded as `call` accesses (or an `invoked`
 *   function); the model can follow them. So is a call of a local bound to
 *   a function literal and never reassigned, or of a named function
 *   expression's own name: a `call` of that literal's unit.
 * - Any other callee (an import, a global, a closure or local binding not
 *   known to hold a function literal, a property of another object, a member
 *   the model cannot follow) also produces a `call` uncertainty.
 * Arguments of anything but an assumed call may be run right away by the callee.
 */
export function visitCall(walker: Walker, node: ESTree.CallExpression | ESTree.NewExpression): void {
	const callee = unwrapExpression(node.callee);
	const assumed = node.type === "CallExpression" && walker.draft.assumptions.assumeCall(node) !== null;

	if (assumed) {
		if (!isNamedReference(callee)) {
			walker.visit(callee, "run");
		}
	} else if (node.type === "NewExpression") {
		visitConstruct(walker, node, callee);
	} else if (callee.type === "MemberExpression") {
		visitMember(walker, callee, "call");
	} else if (callee.type === "Super") {
		emitUnknown(walker, "super", node);
	} else if (isDirectEval(walker, node, callee)) {
		emitUnknown(walker, "eval", node);
	} else if (isFunctionNode(callee)) {
		visitFunctionLiteral(walker, callee, "invoked");
	} else if (callee.type === "Identifier") {
		visitNamedCall(walker, node, callee);
	} else {
		walker.visit(callee, "run");
		emitUnknown(walker, "call", node);
	}

	for (const argument of node.arguments) {
		walker.visit(argument, assumed ? "assumed" : "run");
	}
}

function emitUnitCall(walker: Walker, literal: FunctionNode, callee: ESTree.Node): void {
	const { draft } = walker;
	const target: UnitTarget = { kind: "unit", unit: draft.unitByNode.get(literal) ?? "" };
	if (target.unit === "") {
		// A hoisted local function called before its declaration is walked.
		draft.unresolvedUnitTargets.push({ node: literal, target });
	}

	emitAccess(walker, "call", target, callee);
}

function visitConstruct(walker: Walker, node: ESTree.NewExpression, callee: ESTree.Node): void {
	const resolution = callee.type === "Identifier" ? resolveIdentifier(walker, callee) : null;
	if (resolution?.kind !== "class") {
		walker.visit(callee, "run");
		emitUnknown(walker, "construct", node);
		return;
	}

	emitAccess(walker, "construct", resolution.target, callee);
	const classNode = walker.draft.declarations.get(resolution.class)?.node;
	const isDerived =
		(classNode?.type === "ClassDeclaration" || classNode?.type === "ClassExpression") &&
		classNode.superClass !== null;
	if (isDerived) {
		// The parent constructor is outside the model.
		emitUnknown(walker, "construct", node);
	}
}

function visitNamedCall(walker: Walker, node: ESTree.CallExpression, callee: ESTree.IdentifierReference): void {
	const resolution = resolveIdentifier(walker, callee);
	if (resolution.kind === "local") {
		// A local initialized with a function literal is already a `bound-locally` unit.
		const literal = resolution.initializer === null ? null : unwrapExpression(resolution.initializer);
		if (literal !== null && isFunctionNode(literal)) {
			emitUnitCall(walker, literal, callee);
		} else {
			emitUnknown(walker, "call", node);
		}

		return;
	}

	emitAccess(walker, "call", resolution.target, callee);
	const declaration =
		resolution.target.declaration === null
			? undefined
			: walker.draft.declarations.get(resolution.target.declaration);
	if (resolution.target.scope !== "module" || !isFollowable(declaration)) {
		emitUnknown(walker, "call", node);
	}
}
