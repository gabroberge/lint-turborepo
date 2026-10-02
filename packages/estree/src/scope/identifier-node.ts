import type { ESTree } from "@oxlint/plugins";

/** Any identifier node, whatever position it was parsed in. */
export type IdentifierNode = Extract<ESTree.Node, { type: "Identifier" }>;
