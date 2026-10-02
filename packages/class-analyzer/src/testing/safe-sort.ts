import type { AnalyzedMember, ClassAssumptions } from "../index";
import { analyzeMembers, blockedMoves, constrainedOrder, initializationConstraints, NO_ASSUMPTIONS } from "../index";
import { parseWithScope } from "./parse-with-scope";

export interface SafeSort {
	/** Preferred moves withheld because the members may interact, as `[earlier, later]` label pairs. */
	blocked: [string, string][];
	/** Member labels in the order the sort settles on. */
	order: string[];
	/** The source with the class members re-emitted in `order`. */
	source: string;
}

/**
 * A small consumer of the public API: sorts the members of the first class
 * of `code` alphabetically by label (source position breaks ties), keeping
 * every pair whose initializers conflict in source order, and reports the
 * moves an uncertain conflict withheld. Members are named as
 * `parseWithScope` labels them.
 */
export function safeSort(code: string, assumptions: ClassAssumptions = NO_ASSUMPTIONS): SafeSort {
	const { body, labels, sourceCode } = parseWithScope(code);
	const members = analyzeMembers(body);
	const conflictAt = initializationConstraints(sourceCode, body, members, assumptions);
	const label = ({ index }: AnalyzedMember): string => labels[index] ?? "";
	const byName = (left: AnalyzedMember, right: AnalyzedMember): number => {
		const [first, second] = [label(left), label(right)];
		return first === second ? left.index - right.index : first < second ? -1 : 1;
	};

	const ordered = constrainedOrder(members, byName, (earlier, later) => conflictAt(earlier, later) !== "none");
	const first = members.at(0);
	const last = members.at(-1);
	const source =
		first === undefined || last === undefined
			? code
			: [
					code.slice(0, first.node.range[0]),
					ordered.map(({ node }) => code.slice(...node.range)).join("\n\t"),
					code.slice(last.node.range[1])
				].join("");

	return {
		blocked: blockedMoves(members, byName, conflictAt).map(({ earlier, later }) => [label(earlier), label(later)]),
		order: ordered.map(label),
		source
	};
}
