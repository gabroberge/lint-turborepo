import type { TitleLiteral } from "./static-title";

export interface SplitTitle extends WhenSplit {
	literal: TitleLiteral;
}

export interface WhenSplit {
	condition: string;
	describeTitle: string;
	outcome: string;
}

const WHEN_OCCURRENCES = /\bwhen\b/giu;

export function splitWhen(value: string): WhenSplit | null {
	const matches = [...value.matchAll(WHEN_OCCURRENCES)];
	if (matches.length !== 1) {
		return null;
	}

	const match = matches[0];
	if (match === undefined) {
		return null;
	}

	const whenWord = match[0];
	const outcome = value.slice(0, match.index).trim();
	const condition = value.slice(match.index + whenWord.length).trim();
	if (outcome === "" || condition === "") {
		return null;
	}

	return { condition, describeTitle: `${whenWord} ${condition}`, outcome };
}
