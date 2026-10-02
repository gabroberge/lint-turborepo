import type { ESTree } from "@oxlint/plugins";

import { describeOrTestCall } from "./describe-or-test-call";
import { staticTitle } from "./static-title";

const PROPERTY_TITLE = /^[a-zA-Z][a-zA-Z0-9]*$/u;
const WHEN_TITLE = /^when\b/u;

export type ClassifiedChild =
	| { kind: "property"; statement: ESTree.Statement; title: string }
	| { kind: "setup"; statement: ESTree.Statement }
	| { kind: "when"; statement: ESTree.Statement };

export type SuiteChild = ClassifiedChild | UnclassifiedChild;

export interface UnclassifiedChild {
	kind: "unclassified";
	node: ESTree.Node;
}

/**
 * A direct suite child is setup, a `when` describe, a property describe, or
 * unclassified. Property is matched before `when` so the identifier `when` is
 * a property title.
 */
export function classifyChild(statement: ESTree.Statement): SuiteChild {
	const invocation = describeOrTestCall(statement);
	if (invocation === null) {
		return { kind: "setup", statement };
	}

	if (invocation.kind === "test") {
		return { kind: "unclassified", node: invocation.call };
	}

	const title = staticTitle(invocation.call);
	if (title !== null && PROPERTY_TITLE.test(title)) {
		return { kind: "property", statement, title };
	}

	if (title !== null && WHEN_TITLE.test(title)) {
		return { kind: "when", statement };
	}

	return { kind: "unclassified", node: invocation.call };
}
