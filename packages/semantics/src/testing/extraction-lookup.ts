import type { Declaration, MemberKey, ModuleModel, Receiver, Unit } from "../index";

/** The only declaration with this qualified name (and kind, when given); throws when there is none or several. */
export function declarationOf(model: ModuleModel, qualifiedName: string, kind?: Declaration["kind"]): Declaration {
	const found = [...model.declarations.values()].filter(
		(declaration) =>
			declaration.qualifiedName === qualifiedName && (kind === undefined || declaration.kind === kind)
	);
	const [only] = found;
	if (only === undefined || found.length > 1) {
		throw new Error(`Expected one declaration named ${qualifiedName}, found ${String(found.length)}`);
	}

	return only;
}

/**
 * A declaration as one line, with its kind, qualified name and the flags
 * that matter for it: `variable let counter = other (reassigned)`,
 * `import ns = * from "lib"`, `field Cart.#x [#x] private = other`.
 */
export function describeDeclaration(declaration: Declaration): string {
	const exported = "exported" in declaration && declaration.exported ? " (exported)" : "";
	if (declaration.kind === "class") {
		return `class ${declaration.qualifiedName}${exported}`;
	}

	if (declaration.kind === "function") {
		return `function ${declaration.qualifiedName}${exported}${declaration.reassigned ? " (reassigned)" : ""}`;
	}

	if (declaration.kind === "import") {
		const typeOnly = declaration.typeOnly ? " (type)" : "";
		return `import ${declaration.qualifiedName} = ${declaration.imported} from "${declaration.source}"${typeOnly}`;
	}

	if (declaration.kind === "variable") {
		const reassigned = declaration.reassigned ? " (reassigned)" : "";
		return `variable ${declaration.declarationKind} ${declaration.qualifiedName} = ${declaration.value}${exported}${reassigned}`;
	}

	const flags = [
		declaration.static ? "static" : "",
		declaration.signature ? "signature" : "",
		declaration.value === "none" ? "" : `= ${declaration.value}`
	].filter((flag) => flag !== "");
	return [
		declaration.kind,
		declaration.qualifiedName,
		`[${describeKey(declaration.key)}]`,
		declaration.visibility,
		...flags
	].join(" ");
}

/**
 * The shape of a unit as one line: its kind, trigger, receiver, parent and
 * owning declaration, such as `method | invocation | instance Cart | in module | of Cart.total`.
 */
export function describeUnit(model: ModuleModel, unit: Unit): string {
	const parent = unit.parent === null ? "root" : `in ${model.units.get(unit.parent)?.label ?? unit.parent}`;
	const owner =
		unit.declaration === null
			? "of nothing"
			: `of ${model.declarations.get(unit.declaration)?.qualifiedName ?? unit.declaration}`;
	return [unit.kind, unit.trigger, describeReceiver(model, unit.receiver), parent, owner].join(" | ");
}

/** The labels of every unit of the model, in creation order. */
export function unitLabels(model: ModuleModel): string[] {
	return [...model.units.values()].map((unit) => unit.label);
}

function describeKey(key: MemberKey | null): string {
	if (key === null) {
		return "computed";
	}

	return key.private ? `#${key.name}` : JSON.stringify(key.name);
}

function describeReceiver(model: ModuleModel, receiver: Receiver): string {
	if (receiver.kind === "none" || receiver.kind === "unknown") {
		return `this: ${receiver.kind}`;
	}

	return `this: ${receiver.kind} ${model.declarations.get(receiver.class)?.qualifiedName ?? receiver.class}`;
}
