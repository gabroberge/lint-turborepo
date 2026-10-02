import type { ESTree } from "@oxlint/plugins";

const CALL_MODIFIERS = new Set(["skipIf", "runIf"]);
const DESCRIBE_MODIFIERS = new Set(["only", "skip", "concurrent", "sequential"]);
const TEST_MODIFIERS_ON_INNER = new Set(["fails", "failing"]);

export interface CalleeModifiers {
	describeModifiers: string;
	rest: ESTree.Node;
	testModifiers: string;
}

/**
 * Modifiers between the test identifier and the `.each` / `.for` factory.
 * `only`, `skip`, `concurrent`, `sequential`, `skipIf`, and `runIf` move
 * with the dataset. `fails` / `failing` stay on the test. Optional chaining
 * and unknown members refuse.
 */
export function collectCalleeModifiers(source: string, current: ESTree.Node): CalleeModifiers | null {
	let describeModifiers = "";
	let testModifiers = "";

	for (;;) {
		if (current.type === "ChainExpression") {
			return null;
		}

		if (current.type === "MemberExpression") {
			if (current.computed || current.optional || current.property.type !== "Identifier") {
				return null;
			}

			const name = current.property.name;
			if (TEST_MODIFIERS_ON_INNER.has(name)) {
				testModifiers = `.${name}${testModifiers}`;
			} else if (DESCRIBE_MODIFIERS.has(name)) {
				describeModifiers = `.${name}${describeModifiers}`;
			} else {
				return null;
			}

			current = current.object;
			continue;
		}
		if (current.type === "CallExpression") {
			if (current.optional) {
				return null;
			}

			const callee: ESTree.Expression = current.callee;
			if (
				callee.type !== "MemberExpression" ||
				callee.computed ||
				callee.optional ||
				callee.property.type !== "Identifier" ||
				!CALL_MODIFIERS.has(callee.property.name)
			) {
				return null;
			}

			const name = callee.property.name === "runIf" ? "runIf" : "skipIf";
			describeModifiers = `.${name}${source.slice(callee.range[1], current.range[1])}${describeModifiers}`;
			current = callee.object;
			continue;
		}

		break;
	}

	return { describeModifiers, rest: current, testModifiers };
}
