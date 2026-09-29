import type { Expression } from "typescript";
import {
	isAsExpression,
	isNonNullExpression,
	isParenthesizedExpression,
	isSatisfiesExpression,
	isTypeAssertionExpression
} from "typescript";

export function unwrapExpression(expression: Expression): Expression {
	let current = expression;

	while (
		isAsExpression(current) ||
		isNonNullExpression(current) ||
		isParenthesizedExpression(current) ||
		isSatisfiesExpression(current) ||
		isTypeAssertionExpression(current)
	) {
		current = current.expression;
	}

	return current;
}
