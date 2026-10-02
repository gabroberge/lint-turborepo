/**
 * The source of a class `A` with `size` fields and `size` methods in one
 * call chain: field `f<i>` calls method `m<i>`, which calls `m<i + 1>` and
 * reads `f<i>`. Every unit reaches the rest of the chain, so it exercises
 * the cost of the transitive queries on a large class.
 */
export function queryChainClass(size: number): string {
	const lines = ["class A {"];
	for (let index = 0; index < size; index += 1) {
		const next = index + 1 < size ? `this.m${String(index + 1)}() + ` : "";
		lines.push(
			`\tf${String(index)} = this.m${String(index)}();`,
			`\tm${String(index)}(): number { return ${next}this.f${String(index)}; }`
		);
	}

	lines.push("}");
	return lines.join("\n");
}
