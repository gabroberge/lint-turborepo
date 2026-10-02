import type { FunctionNode } from "@gabroberge/oxlint-estree";

import { addUnit } from "../build/add-unit";
import type { FunctionDisposition } from "../model/fact";
import type { Receiver } from "../model/unit";
import { lineOf } from "./line-of";
import { walkFunctionUnit } from "./walk-function-unit";
import type { Walker } from "./walker";

/**
 * A function literal in the unit's code becomes a unit of its own, and a
 * `function` fact records what happens to it. An arrow function shares the
 * enclosing unit's receiver; any other function's `this` depends on how it
 * is called. A stored literal, or one passed to an assumed call, belongs to
 * the declaration being initialized or assigned (`total = computed(() => …)`).
 */
export function visitFunctionLiteral(walker: Walker, node: FunctionNode, disposition: FunctionDisposition): void {
	const { draft, unit: parent } = walker;
	const receiver: Receiver = node.type === "ArrowFunctionExpression" ? parent.receiver : { kind: "unknown" };
	const name = node.type !== "ArrowFunctionExpression" && node.id !== null ? ` ${node.id.name}` : "";
	const kind = node.type === "ArrowFunctionExpression" ? "arrow" : "function";
	const unit = addUnit(draft, {
		code: [node],
		declaration: disposition === "stored" || disposition === "passed-to-assumed" ? walker.storeOwner : null,
		kind: "function",
		label: `${parent.label} > ${kind}${name} (line ${String(lineOf(draft.sourceCode, node))})`,
		node,
		parent: parent.id,
		receiver,
		trigger: "invocation"
	});
	draft.boundaries.add(node);
	draft.unitByNode.set(node, unit.id);
	walker.emit({ disposition, kind: "function", node, unit: unit.id });
	walkFunctionUnit(draft, unit, node);
}
