import type { ESTree } from "@oxlint/plugins";

import type { CallAssumption, ClassAssumptions } from "../index";

/** The module whose exports `FRAMEWORK_ASSUMPTIONS` knows about. */
export const FRAMEWORK_MODULE = "./framework";

/** An import line bringing every known export of the fake framework into scope. */
export const FRAMEWORK_IMPORT = 'import { cell, defer, derive, provide, store } from "./framework";';

/**
 * What the fake framework's exports are assumed to be: `cell` and `derive`
 * create callable signal-like values, `defer`, `provide` and `store` are
 * order-insensitive factories.
 */
const KNOWN_EXPORTS: ReadonlyMap<string, CallAssumption> = new Map([
	["cell", "signal-factory"],
	["defer", "factory"],
	["derive", "signal-factory"],
	["provide", "factory"],
	["store", "factory"]
]);

/**
 * Assumptions for a fake framework: a call to a binding imported from
 * `./framework` (aliases included) is a factory or signal factory, by the
 * export it names. A same-named function from anywhere else stays unknown
 * code.
 */
export const FRAMEWORK_ASSUMPTIONS: ClassAssumptions = {
	assumeCall(call) {
		if (call.callee.type !== "Identifier") {
			return null;
		}

		const imported = frameworkImports(programOf(call)).get(call.callee.name);
		return imported === undefined ? null : (KNOWN_EXPORTS.get(imported) ?? null);
	}
};

/** Local names imported from the fake framework, mapped to the export each one names. */
function frameworkImports(program: ESTree.Program): Map<string, string> {
	const names = new Map<string, string>();
	for (const statement of program.body) {
		if (statement.type !== "ImportDeclaration" || statement.source.value !== FRAMEWORK_MODULE) {
			continue;
		}

		for (const specifier of statement.specifiers) {
			if (specifier.type !== "ImportSpecifier") {
				continue;
			}

			const { imported } = specifier;
			names.set(specifier.local.name, imported.type === "Identifier" ? imported.name : imported.value);
		}
	}

	return names;
}

function programOf(node: ESTree.Node): ESTree.Program {
	let current = node;
	while (current.type !== "Program") {
		current = current.parent;
	}

	return current;
}
