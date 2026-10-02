/**
 * Disallow a subclass test that covers one inherited property on its own.
 *
 * Test inherited behavior on the declaring type. A subclass test that covers
 * one inherited property on its own is still that type's test, even when it is
 * the only one. That includes a single `it` / `test` and `it.each` /
 * `test.each`.
 *
 * Composition is allowed: a subclass test may use inherited properties together
 * with properties the subclass declares. An input that cannot be tied to one
 * inherited property is left alone — several keys, a spread, a local variable,
 * or a nested helper.
 *
 * Ownership comes from class fields, including constructor parameter
 * properties, along a chain of classes that extend a named class. Relative
 * imports and named re-exports are followed. The ancestor's spec is not read.
 *
 * The rule recognizes an input only when it is an object literal passed to
 * `.transform`, `plainToInstance`, or `plainToClass`, or the `.each` row
 * parameter when every static row is an object with that same single key.
 * The class is the `metatype`, the `plainToInstance` / `plainToClass` target,
 * a plain type annotation on that call, or `toBeInstanceOf` when that name
 * resolves to a class. A `.transform` that does not name a class is used only
 * when the file has exactly one resolved subclass.
 *
 * No autofix.
 *
 * Deliberate limitations:
 * - Titles are ignored. Helpers, local variables, and nested functions are not
 *   treated as the input.
 * - Mixins, mapped types, dynamic heritage, class decorators, subclass
 *   constructors, methods, accessors, index signatures, and computed property
 *   names make ownership unknown.
 * - A subclass that redeclares a property owns it, including when the new
 *   field only adds decorators.
 * - `.for`, tagged-template tables, and non-static `.each` tables are not
 *   treated as this coverage. Unresolved imports and package classes are not
 *   assumed.
 * - Several subclasses in one file are not assumed: name the class at the call.
 * - `toBeInstanceOf` of an unresolved class (for example a Nest HTTP
 *   exception) is ignored so it does not hide the class under test.
 */

import type { PluginRule } from "@gabroberge/oxlint-plugin";

import { lint } from "./lint";

export const noInheritedPropertyTestMatrixRule: PluginRule = {
	create(context) {
		return lint(context);
	},
	defaultSeverity: "error",
	meta: {
		defaultOptions: [],
		docs: {
			description: "Disallow a subclass test that covers one inherited property on its own."
		},
		messages: {
			inheritedPropertyMatrix:
				"`{{property}}` is inherited from `{{owner}}`. Test that inherited behavior on the declaring type. A subclass test may compose it with a property the subclass declares."
		},
		schema: [],
		type: "problem"
	},
	name: "no-inherited-property-test-matrix"
};
