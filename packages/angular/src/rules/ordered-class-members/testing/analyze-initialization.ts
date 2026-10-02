import type { Conflict } from "@gabroberge/typescript-class-analyzer";
import { initializationConstraints } from "@gabroberge/typescript-class-analyzer";

import { angularAssumptions } from "../angular/angular-assumptions";
import { memberLabelled } from "./member-labelled";
import { parseClass } from "./parse-class";

export interface InitializationAnalysis {
	conflict: (first: string, second: string) => Conflict;
}

/** Runs the initialization analysis on the first class of `code`, with the Angular assumptions, looking members up by label. */
export function analyzeInitialization(code: string): InitializationAnalysis {
	const { body, members, sourceCode } = parseClass(code);
	const conflictAt = initializationConstraints(sourceCode, body, members, angularAssumptions(sourceCode));

	return {
		conflict(first, second) {
			const left = memberLabelled(members, first);
			const right = memberLabelled(members, second);
			return left.index < right.index ? conflictAt(left, right) : conflictAt(right, left);
		}
	};
}
