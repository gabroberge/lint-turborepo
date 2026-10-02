import type { ESTree } from "@oxlint/plugins";

import type { DeclarationId } from "./ids";
import type { MemberKey } from "./member-key";
import type { Visibility } from "./visibility";

/** A class declared at module level (a declaration, or a class expression bound by a module `const`). */
export interface ClassEntity extends DeclarationBase {
	exported: boolean;
	kind: "class";
}

/** A declaration the model knows about. */
export type Declaration = ClassEntity | FunctionEntity | ImportEntity | MemberEntity | VariableEntity;

/**
 * What a field holds once initialized, as far as calling it is concerned:
 * nothing (no initializer), a function literal, the result of a call the
 * assumptions describe as returning a signal-like callable, or any other
 * value (which may be a function from anywhere).
 */
export type FieldValue = "assumed-callable" | "function" | "none" | "other";

/** A module-level `function` declaration. */
export interface FunctionEntity extends DeclarationBase {
	exported: boolean;
	kind: "function";
	/** True when the binding is assigned again after its declaration. */
	reassigned: boolean;
}

/** A binding introduced by an `import` declaration. */
export interface ImportEntity extends DeclarationBase {
	/** The imported name: an export name, `default`, or `*` for a namespace import. */
	imported: string;
	kind: "import";
	source: string;
	/** True for `import type` and `import { type x }`, which do not exist at runtime. */
	typeOnly: boolean;
}

/** An element of a class body, or a constructor parameter property. */
export interface MemberEntity extends DeclarationBase {
	class: DeclarationId;
	/** The runtime key, or `null` for a computed key that is not a string or number literal. */
	key: MemberKey | null;
	kind:
		| "accessor-field"
		| "constructor"
		| "field"
		| "getter"
		| "index-signature"
		| "method"
		| "parameter-property"
		| "setter"
		| "static-block";
	/**
	 * True when a field, accessor field, parameter property or method is
	 * assigned in the module outside its own declaration: `this.key = …`,
	 * `this.key += …`, `this.key++` or a destructuring target `this.key`
	 * written in the class body (on the side of the class element containing
	 * it), or `ClassName.key = …` for a static member anywhere in the module.
	 * Assignments through other aliases are not seen. Always `false` for
	 * other kinds (assigning a getter's key runs the setter).
	 */
	reassigned: boolean;
	/** True for a body-less method signature (an overload or an abstract method). */
	signature: boolean;
	static: boolean;
	/** For fields and accessor fields; `none` otherwise. */
	value: FieldValue;
	visibility: Visibility;
}

/** A module-level variable declared with `const`, `let` or `var`. */
export interface VariableEntity extends DeclarationBase {
	declarationKind: "const" | "let" | "var";
	exported: boolean;
	kind: "variable";
	/** True when the binding is assigned after its declaration. */
	reassigned: boolean;
	/** What the declarator's initializer evaluates to, as for fields. */
	value: FieldValue;
}

interface DeclarationBase {
	id: DeclarationId;
	/** The declared name, or `null` when there is none (a static block, a computed key, an anonymous default export). */
	name: string | null;
	node: ESTree.Node;
	/** A readable, not necessarily unique, path such as `Cart`, `Cart.total` or `Cart.#items`. */
	qualifiedName: string;
}
