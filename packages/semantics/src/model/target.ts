import type { DeclarationId } from "./ids";
import type { MemberKey } from "./member-key";

/** What an access touches. */
export type AccessTarget = BindingTarget | MemberTarget | PropertyTarget;

/**
 * Where a binding is declared relative to the unit that touches it:
 * - `closure`: in an enclosing function or unit, captured by this one;
 * - `module`: at module level (variables, functions, classes);
 * - `import`: an imported binding;
 * - `global`: unresolved, or an implicit or declared global.
 * Bindings local to the unit itself are not reported.
 */
export type BindingScope = "closure" | "global" | "import" | "module";

/** A variable binding outside the unit. */
export interface BindingTarget {
	/** The module-level declaration, or `null` for closure, global and unresolved bindings. */
	declaration: DeclarationId | null;
	kind: "binding";
	/**
	 * True when the binding can change after its declaration: it is assigned
	 * again somewhere, it is a parameter of an enclosing function, or it is a
	 * global other than `undefined`, `NaN` and `Infinity`. Imports are never
	 * mutable here, although ES imports are live bindings.
	 */
	mutable: boolean;
	name: string;
	scope: BindingScope;
}

/**
 * A member of a class declared in the module, reached through `this`, the
 * class's own name, or another module class's name (`Other.count`).
 * `member` is `null` when the class does not declare that key: an inherited
 * or dynamically added member, whose behaviour is unknown.
 */
export interface MemberTarget {
	class: DeclarationId;
	key: MemberKey;
	kind: "member";
	member: DeclarationId | null;
	static: boolean;
}

/**
 * A property of an object that is not a class tracked by the model: a
 * service, a parameter, a global object. Its state belongs to someone else.
 */
export interface PropertyTarget {
	kind: "property";
	/** The property name when static, else `null`. */
	name: string | null;
}
