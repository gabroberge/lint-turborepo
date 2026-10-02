import type { Stats } from "node:fs";
import { readFileSync, statSync } from "node:fs";
import type { SourceFile } from "typescript";
import { createSourceFile, ScriptTarget } from "typescript";

import { scriptKind } from "./script-kind";

interface CachedSource {
	mtimeMs: number;
	source: SourceFile;
}

const sourceCache = new Map<string, CachedSource>();

export function readSource(filename: string): SourceFile | null {
	let stat: Pick<Stats, "mtimeMs">;
	try {
		stat = statSync(filename);
	} catch {
		return null;
	}

	const cached = sourceCache.get(filename);
	if (cached?.mtimeMs === stat.mtimeMs) {
		return cached.source;
	}

	let text: string;
	try {
		text = readFileSync(filename, "utf8");
	} catch {
		return null;
	}

	const source = createSourceFile(filename, text, ScriptTarget.Latest, true, scriptKind(filename));
	sourceCache.set(filename, { mtimeMs: stat.mtimeMs, source });
	return source;
}
