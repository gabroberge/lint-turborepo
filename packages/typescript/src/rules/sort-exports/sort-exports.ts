/**
 * Sort consecutive `export … from` statements by module path, then by the
 * names they export.
 *
 * The specifier is the `from` string, compared by code units, so
 * `./range/end-of.js` stays with the other `./range/` entries and comes before
 * `./shape/`. Two exports of the same module put `export type` after a value
 * export, then order by the names they export. A type export is not pulled in
 * front of a value export from an earlier module.
 *
 * Any other statement ends the group. `export const` and `export function`
 * stay where they are, and the `export … from` statements on either side are
 * sorted on their own.
 *
 * Autofix moves each statement with the comments on the lines directly above
 * it. Blank lines between statements stay in place. A comment on the same line
 * as a statement is left where it is, and that group is reported without a
 * fix. Names inside a single `export { … }` stay in the order they were
 * written.
 */

import type { PluginRule } from "@gabroberge/oxlint-plugin";

import { lint } from "./lint";

export const sortExportsRule: PluginRule = {
	create(context) {
		return {
			Program(node) {
				lint(context, node);
			}
		};
	},
	defaultSeverity: "error",
	meta: {
		defaultOptions: [],
		docs: {
			description: "Sort re-export statements by module path.",
			recommended: true
		},
		fixable: "code",
		messages: {
			unsorted: "Sort these re-exports by their module path."
		},
		schema: [],
		type: "layout"
	},
	name: "sort-exports"
};
