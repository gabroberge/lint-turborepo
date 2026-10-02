import type { SourceFile } from "typescript";
import { createSourceFile, ScriptKind, ScriptTarget } from "typescript";

export function sourceFrom(code: string): SourceFile {
	return createSourceFile("fixture.ts", code, ScriptTarget.Latest, true, ScriptKind.TS);
}
