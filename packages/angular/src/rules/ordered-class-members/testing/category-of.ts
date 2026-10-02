import { memberCategory } from "../member/member-category";
import type { Category } from "../options/categories";
import { lines } from "./lines";
import { parseClass } from "./parse-class";

const IMPORTS = lines(
	'import { computed, inject, input, linkedSignal, model, output, signal } from "@angular/core";',
	'import { Token } from "./lib";'
);

/** The category of the first member of an abstract class whose body is `member`, with the Angular APIs imported. */
export function categoryOf(member: string): Category {
	const { members, sourceCode } = parseClass(`${IMPORTS}abstract class A {\n\t${member}\n}\n`);
	const first = members[0];
	if (first === undefined) {
		throw new Error("Expected a member");
	}

	return memberCategory(sourceCode, first.node, first.key);
}
