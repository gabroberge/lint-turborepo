import type { ModuleModel, ReachedFact } from "../index";
import { queryLabel } from "./query-describe-edge";
import { queryDescribeFact } from "./query-describe-fact";

/**
 * A reached fact as one line: the fact, then the call chain leading to it
 * when it is not the starting unit's own, such as
 * `read A.x (A.y (initializer) -calls-> A.ping -calls-> A.pong)`.
 */
export function queryDescribeReached(model: ModuleModel, code: string, reached: ReachedFact): string {
	const fact = queryDescribeFact(model, code, reached.fact);
	const [first] = reached.path;
	if (first === undefined) {
		return fact;
	}

	const chain = reached.path.map((edge) => ` -${edge.kind}-> ${queryLabel(model, edge.to)}`).join("");
	return `${fact} (${queryLabel(model, first.from)}${chain})`;
}
