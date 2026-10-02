import { markOpaque } from "./mark-opaque";
import type { NodeHandlers, NodeOf } from "./node-handler";
import { visitBinding } from "./visit-binding";
import { visitCall } from "./visit-call";
import { visitIdentifier } from "./visit-identifier";
import { visitIteration } from "./visit-iteration";
import { visitMember } from "./visit-member";
import { visitSpread } from "./visit-spread";
import { visitSuspension } from "./visit-suspension";
import { visitTarget } from "./visit-target";
import type { Walker } from "./walker";

type Wrapper = NodeOf<
	| "ChainExpression"
	| "ParenthesizedExpression"
	| "TSAsExpression"
	| "TSInstantiationExpression"
	| "TSNonNullExpression"
	| "TSSatisfiesExpression"
	| "TSTypeAssertion"
>;

function nothing(): void {
	// Evaluating it has no effect.
}

function passThrough(walker: Walker, node: Wrapper, flow: boolean): void {
	walker.visit(node.expression, flow);
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
		walker.visit(node.right, false);
	},
	AwaitExpression: visitSuspension,
	CallExpression: visitCall,
	CatchClause(walker, node) {
		if (node.param !== null) {
			visitBinding(walker, node.param);
		}

		walker.visit(node.body, false);
	},
	ChainExpression: passThrough,
	ClassDeclaration: markOpaque,
	ClassExpression: markOpaque,
	ConditionalExpression(walker, node, flow) {
		walker.visit(node.test, false);
		walker.visit(node.consequent, flow);
		walker.visit(node.alternate, flow);
	},
	ForInStatement: visitIteration,
	ForOfStatement: visitIteration,
	Identifier: visitIdentifier,
	ImportExpression(walker, node) {
		walker.visit(node.source, false);
		walker.effects.sideEffects = true;
	},
	Literal: nothing,
	LogicalExpression(walker, node, flow) {
		walker.visit(node.left, flow);
		walker.visit(node.right, flow);
	},
	MemberExpression(walker, node) {
		visitMember(walker, node, false);
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
				walker.visit(property.key, false);
			}

			walker.visit(property.value, flow);
		}
	},
	ParenthesizedExpression: passThrough,
	PrivateIdentifier: nothing,
	SequenceExpression(walker, node, flow) {
		for (const [index, expression] of node.expressions.entries()) {
			walker.visit(expression, flow && index === node.expressions.length - 1);
		}
	},
	SpreadElement: visitSpread,
	Super: markOpaque,
	TaggedTemplateExpression(walker, node) {
		walker.visit(node.tag, false);
		walker.visit(node.quasi, false);
		walker.effects.sideEffects = true;
	},
	ThisExpression: markOpaque,
	TSAsExpression: passThrough,
	TSEnumDeclaration: markOpaque,
	TSInstantiationExpression: passThrough,
	TSModuleDeclaration: markOpaque,
	TSNonNullExpression: passThrough,
	TSSatisfiesExpression: passThrough,
	TSTypeAssertion: passThrough,
	UnaryExpression(walker, node) {
		if (node.operator === "delete") {
			visitTarget(walker, node.argument, false);
			walker.effects.sideEffects = true;
			return;
		}

		walker.visit(node.argument, false);
	},
	UpdateExpression(walker, node) {
		visitTarget(walker, node.argument, true);
	},
	VariableDeclarator(walker, node) {
		visitBinding(walker, node.id);
		if (node.init !== null) {
			walker.visit(node.init, false);
		}
	},
	YieldExpression: visitSuspension
};
