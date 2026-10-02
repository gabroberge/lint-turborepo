import { unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import type { ClassEntity } from "../model/declaration";
import type { Unit } from "../model/unit";
import { visitBinding } from "../walk/visit-binding";
import { createWalker, walkCode } from "../walk/walk-code";
import { walkFunctionUnit } from "../walk/walk-function-unit";
import { addUnit } from "./add-unit";
import { buildClassUnits } from "./build-class-units";
import type { ModelDraft } from "./model-draft";

/**
 * Build the unit for the module's top-level code and, through it, the units
 * of every module function and class. Function literals stored in
 * module variables belong to those variables.
 */
export function buildModuleUnit(draft: ModelDraft, program: ESTree.Program): Unit {
	const unit = addUnit(draft, {
		code: [program],
		declaration: null,
		kind: "module",
		label: "module",
		node: program,
		parent: null,
		receiver: { kind: "none" },
		trigger: "module-evaluation"
	});
	for (const statement of program.body) {
		buildStatement(draft, unit, statement);
	}

	for (const { node, target } of draft.unresolvedUnitTargets) {
		target.unit = draft.unitByNode.get(node) ?? target.unit;
	}

	return unit;
}

function buildClass(draft: ModelDraft, unit: Unit, node: ESTree.Class): boolean {
	const id = draft.classByNode.get(node);
	const entity = id === undefined ? undefined : draft.declarations.get(id);
	if (entity?.kind !== "class") {
		return false;
	}

	buildClassUnits(draft, entity satisfies ClassEntity, node, unit);
	return true;
}

function buildDeclarator(draft: ModelDraft, unit: Unit, declarator: ESTree.VariableDeclarator): void {
	const init = declarator.init;
	if (init === null) {
		return;
	}

	const value = unwrapExpression(init);
	if (value.type === "ClassExpression" && buildClass(draft, unit, value)) {
		return;
	}

	const [variable] = declarator.id.type === "Identifier" ? draft.sourceCode.getDeclaredVariables(declarator) : [];
	const owner = variable === undefined ? null : (draft.declarationByVariable.get(variable) ?? null);
	visitBinding(createWalker(draft, unit, null), declarator.id);
	walkCode(draft, unit, init, "store", owner);
}

function buildFunctionDeclaration(draft: ModelDraft, unit: Unit, node: ESTree.Function): void {
	const [variable] = draft.sourceCode.getDeclaredVariables(node);
	const declaration = variable === undefined ? null : (draft.declarationByVariable.get(variable) ?? null);
	const name = node.id?.name ?? "default";
	const functionUnit = addUnit(draft, {
		code: [node],
		declaration,
		kind: "function",
		label: name,
		node,
		parent: unit.id,
		receiver: { kind: "unknown" },
		trigger: "invocation"
	});
	draft.boundaries.add(node);
	draft.unitByNode.set(node, functionUnit.id);
	unit.facts.push({ disposition: "stored", kind: "function", node, unit: functionUnit.id });
	walkFunctionUnit(draft, functionUnit, node);
}

function buildStatement(draft: ModelDraft, unit: Unit, node: ESTree.Node): void {
	if (node.type === "TSEnumDeclaration" || node.type === "TSModuleDeclaration") {
		// Unless ambient (or a `const` enum), their bodies run when the module is evaluated; the model does not analyze them.
		walkCode(draft, unit, node, "run");
		return;
	}

	if (node.type === "TSExportAssignment") {
		walkCode(draft, unit, node.expression, "store");
		return;
	}

	if (node.type === "ImportDeclaration" || node.type.startsWith("TS")) {
		return;
	}

	if (node.type === "ExportNamedDeclaration") {
		if (node.declaration !== null) {
			buildStatement(draft, unit, node.declaration);
		}
	} else if (node.type === "ExportDefaultDeclaration") {
		const declaration = node.declaration;
		if (declaration.type === "FunctionDeclaration" || declaration.type === "ClassDeclaration") {
			buildStatement(draft, unit, declaration);
		} else {
			walkCode(draft, unit, declaration, "store");
		}
	} else if (node.type === "ExportAllDeclaration") {
		// A re-export evaluates nothing in this module.
	} else if (node.type === "FunctionDeclaration") {
		buildFunctionDeclaration(draft, unit, node);
	} else if (node.type === "ClassDeclaration" && buildClass(draft, unit, node)) {
		// Its code is in the class's units.
	} else if (node.type === "VariableDeclaration") {
		for (const declarator of node.declarations) {
			buildDeclarator(draft, unit, declarator);
		}
	} else {
		walkCode(draft, unit, node, "run");
	}
}
