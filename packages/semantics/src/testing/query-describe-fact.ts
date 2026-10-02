import type { Fact, ModuleModel } from "../index";
import { describeFact } from "./describe-fact";

/** `describeFact`, with the fact's source text taken from `code` by the node's range. */
export function queryDescribeFact(model: ModuleModel, code: string, fact: Fact): string {
	const [start, end] = fact.node.range;
	return describeFact(model, code.slice(start, end), fact);
}
