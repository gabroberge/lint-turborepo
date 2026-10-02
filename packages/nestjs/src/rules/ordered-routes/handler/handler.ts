import type { ESTree } from "@oxlint/plugins";

export interface Barrier {
	kind: "barrier";
}

export type ControllerEntry = Barrier | Handler;

export interface Handler {
	kind: "handler";
	method: string;
	originalText: string;
	path: string;
	range: [number, number];
	reportNode: ESTree.Node;
	text: string;
	unfixedArray: boolean;
}
