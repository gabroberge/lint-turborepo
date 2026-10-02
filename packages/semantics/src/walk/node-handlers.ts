import { emitUnknown } from "./emit-unknown";
import type { NodeHandlers, NodeOf } from "./node-handler";
import { visitAssignedValue } from "./visit-assigned-value";
import { visitBinding } from "./visit-binding";
import { visitCall } from "./visit-call";
import { visitChildren } from "./visit-children";
import { visitDecorator } from "./visit-decorator";
import { visitIdentifier } from "./visit-identifier";
import { visitIteration } from "./visit-iteration";
import { visitMember } from "./visit-member";
import { visitSpread } from "./visit-spread";
import { visitSuspension } from "./visit-suspension";
import { visitTarget } from "./visit-target";
import { visitThis } from "./visit-this";
import type { Walker } from "./walker";

type Unanalyzed = NodeOf<"ClassDeclaration" | "ClassExpression" | "TSEnumDeclaration" | "TSModuleDeclaration">;

type Wrapper = NodeOf<
	| "ChainExpression"
	| "ParenthesizedExpression"
	| "TSAsExpression"
	| "TSInstantiationExpression"
	| "TSNonNullExpression"
	| "TSSatisfiesExpression"
	| "TSTypeAssertion"
>;

function jsx(walker: Walker, node: NodeOf<"JSXElement" | "JSXFragment">): void {
	emitUnknown(walker, "call", node);
	visitChildren(walker, node);
}

function nothing(): void {
	// Evaluating it touches nothing outside the unit.
}

function passThrough(walker: Walker, node: Wrapper, flow: Parameters<Walker["visit"]>[1]): void {
	walker.visit(node.expression, flow);
}

function unanalyzed(walker: Walker, node: Unanalyzed): void {
	emitUnknown(walker, "unanalyzed-declaration", node);
}

/**
 * How each runtime node evaluates. `flow` passes through the nodes whose
 * result is the value itself (conditional branches, logical operands, array
 * and object elements, the last expression of a sequence).
 */
export const NODE_HANDLERS: NodeHandlers = {
	ArrayExpression(walker, node, flow) {
		for (const element of node.elements) {
			if (element !== null) {
				walker.visit(element, flow);
			}
		}
	},
	AssignmentExpression(walker, node) {
		visitTarget(walker, node.left, node.operator !== "=");
		visitAssignedValue(walker, node.left, node.right);
	},
	AwaitExpression: visitSuspension,
	CallExpression: visitCall,
	CatchClause(walker, node) {
		if (node.param !== null) {
			visitBinding(walker, node.param);
		}

		walker.visit(node.body, "run");
	},
	ChainExpression: passThrough,
	ClassDeclaration: unanalyzed,
	ClassExpression: unanalyzed,
	ConditionalExpression(walker, node, flow) {
		walker.visit(node.test, "run");
		walker.visit(node.consequent, flow);
		walker.visit(node.alternate, flow);
	},
	Decorator: visitDecorator,
	ForInStatement: visitIteration,
	ForOfStatement: visitIteration,
	Identifier: visitIdentifier,
	ImportExpression(walker, node) {
		walker.visit(node.source, "run");
		emitUnknown(walker, "dynamic-import", node);
	},
	JSXElement: jsx,
	JSXFragment: jsx,
	Literal: nothing,
	LogicalExpression(walker, node, flow) {
		walker.visit(node.left, flow);
		walker.visit(node.right, flow);
	},
	MemberExpression(walker, node) {
		visitMember(walker, node, "read");
	},
	MetaProperty: nothing,
	NewExpression: visitCall,
	ObjectExpression(walker, node, flow) {
		for (const property of node.properties) {
			if (property.type === "SpreadElement") {
				visitSpread(walker, property);
				continue;
			}

			if (property.computed) {
				walker.visit(property.key, "run");
			}

			walker.visit(property.value, flow);
		}
	},
	ParenthesizedExpression: passThrough,
	PrivateIdentifier: nothing,
	SequenceExpression(walker, node, flow) {
		for (const [index, expression] of node.expressions.entries()) {
			walker.visit(expression, index === node.expressions.length - 1 ? flow : "run");
		}
	},
	SpreadElement: visitSpread,
	Super(walker, node) {
		emitUnknown(walker, "super", node);
	},
	TaggedTemplateExpression(walker, node) {
		walker.visit(node.tag, "run");
		walker.visit(node.quasi, "run");
		emitUnknown(walker, "tagged-template", node);
	},
	ThisExpression: visitThis,
	TSAsExpression: passThrough,
	TSEnumDeclaration(walker, node) {
		// An ambient or `const` enum is erased: nothing of it runs.
		if (!node.declare && !node.const) {
			unanalyzed(walker, node);
		}
	},
	TSInstantiationExpression: passThrough,
	TSModuleDeclaration(walker, node) {
		if (!node.declare) {
			unanalyzed(walker, node);
		}
	},
	TSNonNullExpression: passThrough,
	TSSatisfiesExpression: passThrough,
	TSTypeAssertion: passThrough,
	UnaryExpression(walker, node) {
		if (node.operator === "delete") {
			visitTarget(walker, node.argument, false);
			emitUnknown(walker, "delete", node);
			return;
		}

		walker.visit(node.argument, "run");
	},
	UpdateExpression(walker, node) {
		visitTarget(walker, node.argument, true);
	},
	VariableDeclarator(walker, node) {
		visitBinding(walker, node.id);
		if (node.init !== null) {
			walker.visit(node.init, "local");
		}
	},
	YieldExpression: visitSuspension
};
