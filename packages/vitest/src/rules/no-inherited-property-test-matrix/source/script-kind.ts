import { ScriptKind } from "typescript";

export function scriptKind(filename: string): ScriptKind {
	if (filename.endsWith(".tsx")) {
		return ScriptKind.TSX;
	}

	if (filename.endsWith(".mts")) {
		return ScriptKind.TS;
	}

	return ScriptKind.TS;
}
