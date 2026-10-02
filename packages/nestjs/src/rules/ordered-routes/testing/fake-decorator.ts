import type { ESTree } from "@oxlint/plugins";

export function fakeDecorator(): ESTree.Decorator {
	return { type: "Decorator" } as ESTree.Decorator;
}
