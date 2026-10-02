import type { FunctionNode } from "@gabroberge/oxlint-estree";

import { arrow } from "./arrow";
import { block } from "./block";
import { expectDefined } from "./expect-defined";
import { expressionStatement } from "./expression-statement";

export function wiringArrow(): FunctionNode {
	return arrow(block(expressionStatement(expectDefined())));
}
