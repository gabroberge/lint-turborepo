import { graphRandom } from "./graph-random";
import type { QueryField } from "./query-evaluate-class";

export interface QueryRandomClass {
	fields: QueryField[];
	/** The members after the fields: a method, a getter and a setter. */
	rest: string[];
}

const NAMES = ["alpha", "bravo", "charlie", "delta", "echo", "foxtrot", "golf", "hotel"];

/**
 * A reproducible class `A` of 2 to 7 fields, each built from a template: a
 * literal, a pure expression, a logged side effect or a counter, a read,
 * write or call of any field, a stored arrow, a callback run by unknown
 * code, or a use of the method `total`, the getter `sum` or the setter `sum`,
 * which read or write a random field themselves.
 */
export function queryRandomClass(seed: number): QueryRandomClass {
	const random = graphRandom(seed);
	const pick = <Value>(values: readonly Value[]): Value => values[Math.floor(random() * values.length)] as Value;
	const names = NAMES.slice(0, 2 + Math.floor(random() * 6));
	const fields = names.map((name) => {
		const value = Math.floor(random() * 10);
		const templates = [
			`${value}`,
			`${value} * 2 + 1`,
			`record("${name}")`,
			"next()",
			`this.${pick(names)} + ${value}`,
			`() => this.${pick(names)}`,
			`this.${pick(names)}()`,
			`(this.${pick(names)} = ${value})`,
			"this.total()",
			"this.sum",
			`(this.sum = ${value})`,
			`run(() => this.${pick(names)})`,
			`run(() => (this.${pick(names)} = ${value}))`
		];
		return { initializer: pick(templates), name };
	});
	const rest = [
		`\ttotal() { return this.${pick(names)}; }`,
		`\tget sum() { return this.${pick(names)}; }`,
		`\tset sum(value) { this.${pick(names)} = value; }`
	];

	return { fields, rest };
}
