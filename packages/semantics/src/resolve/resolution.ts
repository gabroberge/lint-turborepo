import type { ESTree } from "@oxlint/plugins";

import type { DeclarationId } from "../model/ids";
import type { BindingTarget } from "../model/target";

/**
 * What an identifier refers to, seen from one unit: a binding local to the
 * unit (not reported as a fact), a module class (whose members can be
 * resolved), or any other binding.
 */
export type Resolution =
	| {
			/**
			 * What the local is known to hold: its declarator's initializer or its
			 * function declaration, or `null` when it has none or is assigned again.
			 */
			initializer: ESTree.Node | null;
			kind: "local";
	  }
	| { class: DeclarationId; kind: "class"; target: BindingTarget }
	| { kind: "binding"; target: BindingTarget };
