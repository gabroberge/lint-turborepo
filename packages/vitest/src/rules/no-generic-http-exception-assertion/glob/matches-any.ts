import { matchGlob } from "./match-glob";

export function matchesAny(filename: string, patterns: readonly string[]): boolean {
	return patterns.some((pattern) => matchGlob(filename, pattern));
}
