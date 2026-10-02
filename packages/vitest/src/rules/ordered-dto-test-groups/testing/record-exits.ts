import type { FunctionNode } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import { createSuiteExit } from "../suite/suite-exit";

export interface Exit {
	call: ESTree.CallExpression;
	callback: FunctionNode;
}

export function recordExits(call: ESTree.CallExpression, body: FunctionNode): Exit[] {
	const exits: Exit[] = [];
	const walk = createSuiteExit((describeCallNode, callback) => {
		exits.push({ call: describeCallNode, callback });
	});

	walk.note(call);
	walk.enterFunction(body);
	walk.exitFunction(body);
	return exits;
}
