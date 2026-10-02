import { lines } from "./lines";
import { seededRandom } from "./seeded-random";

const NAMES = ["alpha", "bravo", "charlie", "delta", "echo", "foxtrot", "golf", "hotel", "india", "juliet"];

/**
 * A reproducible class `A` of 2 to 8 fields with shuffled names, each built
 * from a template: a literal, a pure expression, a read of an earlier field,
 * a deferred arrow reading an earlier field, a logged side effect
 * (`record`) or a counter (`next`), the helpers `evaluateClass` provides.
 */
export function randomClass(seed: number): string {
	const random = seededRandom(seed);
	const pick = <Value>(values: readonly Value[]): Value => values[Math.floor(random() * values.length)] as Value;
	const names = NAMES.map((name) => ({ name, weight: random() }))
		.toSorted((left, right) => left.weight - right.weight)
		.map(({ name }) => name)
		.slice(0, 2 + Math.floor(random() * 7));
	const fields = names.map((name, index) => {
		const earlier = names.slice(0, index);
		const value = Math.floor(random() * 10);
		const templates = [
			`${value}`,
			`${value} * 2 + 1`,
			`record("${name}")`,
			"next()",
			...(earlier.length > 0 ? [`this.${pick(earlier)} + ${value}`, `() => this.${pick(earlier)}`] : [])
		];
		return `\t${name} = ${pick(templates)};`;
	});

	return lines("class A {", ...fields, "}");
}
