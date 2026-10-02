export type { AnalyzeOptions } from "./analyze-module";
export { analyzeModule } from "./analyze-module";
export type { Assumptions } from "./assumptions/assumptions";
export type { CallAssumption } from "./assumptions/call-assumption";
export { NO_ASSUMPTIONS } from "./assumptions/no-assumptions";
export type { CallEdge } from "./calls/call-edge";
export { callEdgesFrom } from "./calls/call-edges-from";
export { callGraph } from "./calls/call-graph";
export type { ReachedFact } from "./calls/reached-fact";
export { reachedFacts } from "./calls/reached-facts";
export { recursiveUnitGroups } from "./calls/recursive-unit-groups";
export type { CoverageKind, DecisionKind } from "./decisions/decision-kind";
export type { DecisionOutcome, DecisionPoint, SourceRegion } from "./decisions/decision-point";
export { decisionPoints } from "./decisions/decision-points";
export { decisionPointsIn } from "./decisions/decision-points-in";
export type { Guard } from "./decisions/guard-of";
export { guardOf } from "./decisions/guard-of";
export { declarationDependencies } from "./dependencies/declaration-dependencies";
export type { DeclarationDependency } from "./dependencies/declaration-dependency";
export { ownerOf } from "./dependencies/owner-of";
export { cyclicComponents } from "./graph/cyclic-components";
export type { Path } from "./graph/path";
export { reachableFrom } from "./graph/reachable-from";
export { stronglyConnectedComponents } from "./graph/strongly-connected-components";
export type { Interference, InterferenceEvidence, InterferenceReason } from "./interference/interference";
export { unitInterference } from "./interference/unit-interference";
export type {
	ClassEntity,
	Declaration,
	FieldValue,
	FunctionEntity,
	ImportEntity,
	MemberEntity,
	VariableEntity
} from "./model/declaration";
export type {
	AccessFact,
	AccessMode,
	Fact,
	FunctionDisposition,
	FunctionFact,
	UnknownFact,
	UnknownReason
} from "./model/fact";
export type { DeclarationId, UnitId } from "./model/ids";
export type { MemberKey } from "./model/member-key";
export type { ModuleModel } from "./model/module-model";
export type {
	AccessTarget,
	BindingScope,
	BindingTarget,
	MemberTarget,
	PropertyTarget,
	UnitTarget
} from "./model/target";
export type { Receiver, Trigger, Unit, UnitKind } from "./model/unit";
export type { Visibility } from "./model/visibility";
