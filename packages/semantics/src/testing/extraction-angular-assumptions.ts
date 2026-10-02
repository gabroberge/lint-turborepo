import type { ESTree } from "@oxlint/plugins";

import type { Assumptions, CallAssumption } from "../index";

/** What the fake Angular assumptions know about each `@angular/core` export. */
const ANGULAR_CALLS: ReadonlyMap<string, CallAssumption> = new Map([
	["computed", "signal-factory"],
	["inject", "factory"],
	["signal", "signal-factory"]
]);

/**
 * A fake, Angular-like consumer: a call of `signal`, `computed` or `inject`
 * imported from `@angular/core` (under any local name, generic or not) is
 * described; every other call is unknown. Shadowing is ignored.
 */
export const ANGULAR_ASSUMPTIONS: Assumptions = {
	assumeCall(call) {
		const callee = call.callee.type === "TSInstantiationExpression" ? call.callee.expression : call.callee;
		if (callee.type !== "Identifier") {
			return null;
		}

		const imported = importedFromAngular(programOf(call), callee.name);
		return imported === null ? null : (ANGULAR_CALLS.get(imported) ?? null);
	}
};

/** The name `local` imports from `@angular/core`, or `null`. */
function importedFromAngular(program: ESTree.Program, local: string): string | null {
	for (const statement of program.body) {
		if (statement.type !== "ImportDeclaration" || statement.source.value !== "@angular/core") {
			continue;
		}

		for (const specifier of statement.specifiers) {
			if (
				specifier.type === "ImportSpecifier" &&
				specifier.local.name === local &&
				specifier.imported.type === "Identifier"
			) {
				return specifier.imported.name;
			}
		}
	}

	return null;
}

function programOf(node: ESTree.Node): ESTree.Program {
	let current: ESTree.Node = node;
	while (current.type !== "Program") {
		current = current.parent;
	}

	return current;
}
