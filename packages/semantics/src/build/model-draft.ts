import type { ESTree, SourceCode, Variable } from "@oxlint/plugins";

import type { Assumptions } from "../assumptions/assumptions";
import type { Declaration, MemberEntity } from "../model/declaration";
import type { DeclarationId, UnitId } from "../model/ids";
import type { UnitTarget } from "../model/target";
import type { Unit } from "../model/unit";

/** The model while it is being built, with the indexes construction needs. */
export interface ModelDraft {
	assumptions: Assumptions;
	boundaries: Set<ESTree.Node>;
	/** Module classes by their class node. */
	classByNode: Map<ESTree.Node, DeclarationId>;
	/** Module classes by the module binding that names them (a declaration, or a `const` bound to a class expression). */
	classByVariable: Map<Variable, DeclarationId>;
	/** Module-level declarations by the scope variable they declare. */
	declarationByVariable: Map<Variable, DeclarationId>;
	declarations: Map<DeclarationId, Declaration>;
	/** Members of each module class, in source order. */
	membersByClass: Map<DeclarationId, MemberEntity[]>;
	sourceCode: SourceCode;
	/** The unit of each function literal and function declaration, by its node. */
	unitByNode: Map<ESTree.Node, UnitId>;
	units: Map<UnitId, Unit>;
	/**
	 * `unit` targets recorded before the function literal they reach had its
	 * unit (a call of a hoisted local function), filled in once every unit exists.
	 */
	unresolvedUnitTargets: { node: ESTree.Node; target: UnitTarget }[];
}
