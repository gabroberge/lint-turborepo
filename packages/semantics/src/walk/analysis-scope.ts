import type { Ranged } from "@gabroberge/oxlint-estree";
import type { ESTree, SourceCode } from "@oxlint/plugins";

import type { ClassAssumptions } from "../assumptions/class-assumptions";
import type { MemberKind } from "../effects/member-kind";
import type { Timeline } from "../member/timeline";

export interface AnalysisScope {
	assumptions: ClassAssumptions;
	/** The class's own binding, which names the class itself in static code. */
	classId: ESTree.BindingIdentifier | null;
	kinds: ReadonlyMap<string, MemberKind>;
	/** The member whose code is analyzed. Bindings declared inside it are local. */
	owner: Ranged;
	sourceCode: SourceCode;
	timeline: Timeline;
}
