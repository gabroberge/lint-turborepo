import type { Fact } from "../model/fact";
import type { DeclarationId } from "../model/ids";
import type { ModuleModel } from "../model/module-model";

const OPAQUE_REASONS: ReadonlySet<string> = new Set([
	"dynamic-member",
	"eval",
	"receiver-escape",
	"super",
	"unanalyzed-declaration",
	"unknown-receiver",
	"unsupported-target"
]);

/**
 * How a fact relates to state the model does not track:
 * - `opaque`: the code may touch anything (see `InterferenceReason`), including
 *   any access to a member a module class with a superclass does not declare:
 *   an inherited accessor or method runs unseen code on the same receiver;
 * - `effect`: it runs outside code (an `unknown` `call`, `construct`,
 *   suspension…; a call of a member the model cannot follow, such as a field
 *   holding any value, a getter's result or an abstract member, comes with
 *   such an `unknown` `call` fact), or writes a closure binding or a
 *   property of another object;
 * - `external`: it reads state outside code could change: a mutable
 *   binding, a property of another object, or the state of an assumed
 *   callable it calls (the factory's value, whose `may-run` call edges also
 *   reach the functions it was built from);
 * - `null`: none of these, including calls of a function literal's unit and
 *   constructions of a module class, whose code is reached through call edges.
 *
 * Whether two units' roles make their order matter is decided by
 * `unitInterference`; the classification is a heuristic for that purpose.
 */
export function outsideRole(model: ModuleModel, fact: Fact): "effect" | "external" | "opaque" | null {
	if (fact.kind === "unknown") {
		return OPAQUE_REASONS.has(fact.reason) ? "opaque" : "effect";
	}

	if (fact.kind === "function") {
		return null;
	}

	const { mode, target } = fact;
	if (target.kind === "unit") {
		return null;
	}

	if (target.kind === "property") {
		return mode === "read" ? "external" : "effect";
	}

	if (target.kind === "binding") {
		if (mode === "write") {
			return target.scope === "closure" ? "effect" : null;
		}

		if (mode === "call" && callsAssumedCallable(model, target.declaration)) {
			return "external";
		}

		return target.mutable && mode === "read" ? "external" : null;
	}

	if (target.member === null && hasSuperclass(model, target.class)) {
		return "opaque";
	}

	return mode === "call" && callsAssumedCallable(model, target.member) ? "external" : null;
}

function callsAssumedCallable(model: ModuleModel, declarationId: DeclarationId | null): boolean {
	const declaration = declarationId === null ? undefined : model.declarations.get(declarationId);
	return declaration !== undefined && "value" in declaration && declaration.value === "assumed-callable";
}

function hasSuperclass(model: ModuleModel, classId: DeclarationId): boolean {
	const declaration = model.declarations.get(classId);
	return declaration?.kind === "class" && "superClass" in declaration.node && declaration.node.superClass !== null;
}
