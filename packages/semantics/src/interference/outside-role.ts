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
 * - `effect`: it runs outside code (an unknown call, `new`, a suspension…),
 *   calls a value the model cannot follow (a field holding any value, a
 *   parameter property, a getter's result, an abstract or undeclared member), or writes a closure binding
 *   or a property of another object;
 * - `external`: it reads state outside code could change: a mutable
 *   binding, a property of another object, or calls an assumed callable;
 * - `null`: none of these.
 */
export function outsideRole(model: ModuleModel, fact: Fact): "effect" | "external" | "opaque" | null {
	if (fact.kind === "unknown") {
		return OPAQUE_REASONS.has(fact.reason) ? "opaque" : "effect";
	}

	if (fact.kind === "function") {
		return null;
	}

	const { mode, target } = fact;
	if (target.kind === "property") {
		return mode === "read" ? "external" : "effect";
	}

	if (target.kind === "binding") {
		if (mode === "write") {
			return target.scope === "closure" ? "effect" : null;
		}

		return target.mutable && mode === "read" ? "external" : null;
	}

	if (target.member === null && hasSuperclass(model, target.class)) {
		return "opaque";
	}

	if (mode !== "call") {
		return null;
	}

	const member = target.member === null ? undefined : model.declarations.get(target.member);
	if (member === undefined) {
		return "effect";
	}

	if (member.kind === "field" || member.kind === "accessor-field" || member.kind === "parameter-property") {
		return member.value === "function" ? null : member.value === "assumed-callable" ? "external" : "effect";
	}

	// A method's own body is followed; an abstract or overload-only method, or
	// the value a getter returns, is code the model cannot see.
	return member.kind === "method" && !member.signature ? null : "effect";
}

function hasSuperclass(model: ModuleModel, classId: DeclarationId): boolean {
	const declaration = model.declarations.get(classId);
	return declaration?.kind === "class" && "superClass" in declaration.node && declaration.node.superClass !== null;
}
