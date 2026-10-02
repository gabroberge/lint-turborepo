import type { AccessTarget, Fact, ModuleModel } from "../index";

/**
 * A fact as one readable line: `read module total`, `call Cart.refresh`,
 * `unknown call: fetch()`, `function passed-to-unknown: Cart.load > arrow (line 3)`.
 */
export function describeFact(model: ModuleModel, source: string, fact: Fact): string {
	if (fact.kind === "access") {
		return `${fact.mode} ${describeTarget(model, fact.target)}`;
	}

	if (fact.kind === "unknown") {
		return `unknown ${fact.reason}: ${source}`;
	}

	return `function ${fact.disposition}: ${model.units.get(fact.unit)?.label ?? fact.unit}`;
}

function describeTarget(model: ModuleModel, target: AccessTarget): string {
	if (target.kind === "property") {
		return `property ${target.name ?? "[?]"}`;
	}

	if (target.kind === "binding") {
		return `${target.scope} ${target.name}${target.mutable ? " (mutable)" : ""}`;
	}

	const owner = model.declarations.get(target.class)?.qualifiedName ?? target.class;
	const key = target.key.private ? `#${target.key.name}` : target.key.name;
	return `${target.static ? "static " : ""}${owner}.${key}${target.member === null ? " (undeclared)" : ""}`;
}
