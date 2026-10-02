import { lines } from "./lines";

/**
 * A class holding a private field `#zz` followed by `member`, with every
 * Angular API imported (also aliased and as a namespace) and a local
 * `localSignal` function: with no groups, `member` sorts before `#zz` only
 * by its category.
 */
export function categoryFixture(member: readonly string[]): string {
	return lines(
		'import { computed, inject, input, linkedSignal, model, output, signal, signal as writable } from "@angular/core";',
		'import * as ng from "@angular/core";',
		"",
		"class Store {}",
		"",
		"function localSignal<T>(value: T): T {",
		"\treturn value;",
		"}",
		"",
		"class Subject {",
		"\t#zz = 0;",
		...member.map((row) => `\t${row}`),
		"}"
	);
}
