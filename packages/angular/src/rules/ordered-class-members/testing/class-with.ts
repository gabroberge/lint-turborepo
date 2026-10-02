import { lines } from "./lines";

/** A class whose only field is initialized by `value`, after `imports`. */
export function classWith(imports: string, value: string): string {
	return lines(imports, "class A {", `\tfield = ${value};`, "}");
}
