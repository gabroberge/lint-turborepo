import type { ESTree } from "@oxlint/plugins";

import type { Walker } from "./walker";

export type NodeHandler<Type extends NodeType> = (walker: Walker, node: NodeOf<Type>, flow: boolean) => void;

/** Handlers keyed by node type. A type without one has its children visited, or is skipped when type-only. */
export type NodeHandlers = { [Type in NodeType]?: NodeHandler<Type> };

export type NodeOf<Type extends NodeType> = Extract<ESTree.Node, { type: Type }>;

type NodeType = ESTree.Node["type"];
