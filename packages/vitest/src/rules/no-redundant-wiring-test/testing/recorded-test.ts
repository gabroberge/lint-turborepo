import type { FunctionNode } from "@gabroberge/oxlint-estree";

import type { RecordedTest } from "../test/record-executable-test";
import { call } from "./call";
import { identifier } from "./identifier";
import { recordedStatement } from "./recorded-statement";

interface RecordedTestOptions {
	source?: string;
	statement?: string;
	suite: FunctionNode | null;
	wiring: boolean;
}

export function recordedTest(options: RecordedTestOptions): RecordedTest {
	return {
		node: call(identifier("it"), []),
		statement: recordedStatement(options.source, options.statement),
		suite: options.suite,
		wiring: options.wiring
	};
}
