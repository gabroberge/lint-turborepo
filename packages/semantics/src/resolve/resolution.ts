import type { ESTree } from "@oxlint/plugins";

import type { DeclarationId } from "../model/ids";
import type { BindingTarget } from "../model/target";

/**
 * What an identifier refers to, seen from one unit: a binding local to the
 * unit (not reported as a fact), a module class (whose members can be
 * resolved), or any other binding.
 */
export type Resolution =
	| { class: DeclarationId; kind: "class"; target: BindingTarget }
	| { initializer: ESTree.Node | null; kind: "local" }
	| { kind: "binding"; target: BindingTarget };
