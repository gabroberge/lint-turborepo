import type { FunctionNode } from "@gabroberge/oxlint-estree";
import type { ESTree, VisitorWithHooks } from "@oxlint/plugins";

import { createOwningStatement } from "../statement/owning-statement";
import type { RecordedTest } from "./record-executable-test";
import { recordExecutableTest } from "./record-executable-test";

export interface ExecutableTests {
	record: (node: ESTree.CallExpression, suite: FunctionNode | null) => void;
	recorded: () => readonly RecordedTest[];
	visitors: Pick<VisitorWithHooks, "ExpressionStatement:exit" | "ExpressionStatement">;
}

/**
 * Executable `it` / `test` calls seen during a file walk. Owns statement
 * ownership so the recorder, not the orchestrator, tracks it.
 */
export function createExecutableTests(): ExecutableTests {
	const statements = createOwningStatement();
	const tests: RecordedTest[] = [];

	return {
		record: (node: ESTree.CallExpression, suite: FunctionNode | null): void => {
			const recorded = recordExecutableTest(node, suite, statements.of(node));
			if (recorded !== null) {
				tests.push(recorded);
			}
		},
		recorded: (): readonly RecordedTest[] => {
			return tests;
		},
		visitors: statements.visitors
	};
}
