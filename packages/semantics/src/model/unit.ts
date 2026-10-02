import type { ESTree } from "@oxlint/plugins";

import type { Fact } from "./fact";
import type { DeclarationId, UnitId } from "./ids";

/**
 * What `this` denotes in the unit: an instance of a module class, the class
 * itself (static code), nothing usable (module code), or a value that
 * depends on how the unit is called.
 */
export type Receiver =
	| { class: DeclarationId; kind: "class" }
	| { class: DeclarationId; kind: "instance" }
	| { kind: "none" }
	| { kind: "unknown" };

/**
 * When the unit's code runs:
 * - `module-evaluation`: once, when the module is evaluated;
 * - `class-definition`: once, when the class is defined (static fields, static blocks, computed keys, decorators);
 * - `instance-construction`: each time an instance is constructed (instance fields, the constructor);
 * - `invocation`: whenever something calls it.
 */
export type Trigger = "class-definition" | "instance-construction" | "invocation" | "module-evaluation";

/** A piece of code that runs as a whole, with the direct facts about its own code. */
export interface Unit {
	/**
	 * The roots of the unit's own code: a function's node, an initializer
	 * expression, a static block, the class's computed keys and decorators,
	 * or the program. Code inside them that belongs to another unit starts at
	 * a node in `ModuleModel.boundaries`.
	 */
	code: ESTree.Node[];
	/** The declaration the unit belongs to, or `null` for module code and anonymous functions. */
	declaration: DeclarationId | null;
	facts: Fact[];
	id: UnitId;
	kind: UnitKind;
	/** A readable description, such as `Cart.total (initializer)` or `helper`. */
	label: string;
	node: ESTree.Node;
	/** The unit whose code contains this one, for function literals. */
	parent: UnitId | null;
	receiver: Receiver;
	trigger: Trigger;
}

/**
 * What a unit is:
 * - `module`: the module's top-level code;
 * - `class-definition`: a class's computed keys and decorators, evaluated when the class is defined;
 * - `field-initializer`, `static-block`, `constructor`, `method`, `getter`, `setter`: class member code;
 * - `function`: a function declaration or a function literal.
 */
export type UnitKind =
	| "class-definition"
	| "constructor"
	| "field-initializer"
	| "function"
	| "getter"
	| "method"
	| "module"
	| "setter"
	| "static-block";
