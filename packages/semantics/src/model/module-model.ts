import type { ESTree } from "@oxlint/plugins";

import type { Declaration } from "./declaration";
import type { DeclarationId, UnitId } from "./ids";
import type { Unit } from "./unit";

/** Everything the model knows about one module: its declarations and its executable units. */
export interface ModuleModel {
	/**
	 * Nodes where another unit's code starts: function literals and module
	 * classes (whose node covers their members' code). A walk over one unit's code stops at them.
	 */
	boundaries: ReadonlySet<ESTree.Node>;
	declarations: ReadonlyMap<DeclarationId, Declaration>;
	/** The unit for the module's top-level code. */
	moduleUnit: UnitId;
	units: ReadonlyMap<UnitId, Unit>;
}
