/** Sets a non-enumerable `parent` link on every node reachable through `keys`, the way a linter does. */
export function linkParents(
	node: object,
	parent: object | null,
	keys: Record<string, readonly string[] | undefined>
): void {
	Object.defineProperty(node, "parent", { configurable: true, enumerable: false, value: parent, writable: true });
	const { type } = node as { type: string };
	for (const key of keys[type] ?? []) {
		const value: unknown = (node as Record<string, unknown>)[key];
		const children: unknown[] = Array.isArray(value) ? value : [value];
		for (const child of children) {
			if (typeof child === "object" && child !== null && "type" in child) {
				linkParents(child, node, keys);
			}
		}
	}
}
