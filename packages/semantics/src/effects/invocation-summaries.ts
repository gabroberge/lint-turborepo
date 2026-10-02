import type { AnalyzedMember } from "../member/analyzed-member";
import type { Timeline } from "../member/timeline";
import type { AnalysisScope } from "../walk/analysis-scope";
import { collectEffects } from "../walk/collect-effects";
import type { Effects } from "./effects";
import { emptyEffects } from "./empty-effects";
import { mergeEffects } from "./merge-effects";

/**
 * For each member key of a timeline, what running its code does: a method
 * or accessor body, or whatever a field's value may run once called. That
 * is the functions its initializer stores, plus the members it hands on
 * (`a = this.method`). Every function is analyzed as if it ran to
 * completion immediately.
 */
export function invocationSummaries(
	members: readonly AnalyzedMember[],
	scope: Omit<AnalysisScope, "owner">,
	timeline: Timeline
): Map<string, Effects> {
	const summaries = new Map<string, Effects>();

	function add(key: string, effects: Effects): void {
		const summary = summaries.get(key) ?? emptyEffects();
		mergeEffects(summary, effects);
		summaries.set(key, summary);
	}

	for (const { key, node } of members) {
		if (key === null || node.type === "StaticBlock" || node.type === "TSIndexSignature") {
			continue;
		}

		if (node.static !== (timeline === "static")) {
			continue;
		}

		const owner = { ...scope, owner: node };
		if (node.type === "MethodDefinition") {
			if (node.kind !== "constructor" && node.value.body !== null) {
				add(key, collectEffects(node.value, owner, false).effects);
			}

			continue;
		}

		if (node.type !== "PropertyDefinition" && node.type !== "AccessorProperty") {
			continue;
		}

		if (node.value === null) {
			continue;
		}

		const initializer = collectEffects(node.value, owner, true);
		add(key, { ...emptyEffects(), calls: initializer.effects.calls });
		for (const deferred of initializer.deferred) {
			add(key, collectEffects(deferred, owner, false).effects);
		}
	}

	return summaries;
}
