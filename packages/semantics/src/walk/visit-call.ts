import { isFunctionNode, unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import { resolveIdentifier } from "../resolve/resolve-identifier";
import { emitAccess } from "./emit-access";
import { emitUnknown } from "./emit-unknown";
import { isDirectEval } from "./is-direct-eval";
import { isFollowable } from "./is-followable";
import { isFunctionLiteral } from "./is-function-literal";
import { isNamedReference } from "./is-named-reference";
import { visitFunctionLiteral } from "./visit-function-literal";
import { visitMember } from "./visit-member";
import type { Walker } from "./walker";

/**
 * A call or `new`.
 * - A call the assumptions describe produces no uncertainty; function
 *   literals passed to it are `passed-to-assumed`, and its callee is
 *   evaluated unless it is a plain name.
 * - `new` runs code outside the model (`construct`).
 * - A member call, a call of a module binding, and an immediately invoked
 *   function literal are recorded as `call` accesses (or an `invoked`
 *   function); the model can follow them.
 * - Any other callee (an import, a global, a closure or local binding not
 *   known to hold a function literal, a property of another object) also
 *   produces a `call` uncertainty.
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

function visitConstruct(walker: Walker, node: ESTree.NewExpression, callee: ESTree.Node): void {
	walker.visit(callee, "run");
	emitUnknown(walker, "construct", node);
}

function visitNamedCall(walker: Walker, node: ESTree.CallExpression, callee: ESTree.IdentifierReference): void {
	const resolution = resolveIdentifier(walker, callee);
	if (resolution.kind === "local") {
		// A local initialized with a function literal is already a `bound-locally` unit.
		if (!isFunctionLiteral(resolution.initializer)) {
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
