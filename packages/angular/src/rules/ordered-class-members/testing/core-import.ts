/** A named import of `name` from `@angular/core`. */
export function coreImport(name: string): string {
	return `import { ${name} } from "@angular/core";`;
}
