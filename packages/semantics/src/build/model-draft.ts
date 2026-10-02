import type { ESTree, SourceCode, Variable } from "@oxlint/plugins";

import type { Assumptions } from "../assumptions/assumptions";
import type { Declaration, MemberEntity } from "../model/declaration";
import type { DeclarationId, UnitId } from "../model/ids";
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
	units: Map<UnitId, Unit>;
}
