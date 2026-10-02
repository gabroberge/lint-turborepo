import { runInNewContext } from "node:vm";
import ts from "typescript";

/**
 * Transpiles and runs `code`, which declares a `log` array and a `Subject`
 * class, then returns the observable result as JSON: the log, and the
 * instance and static fields of `Subject` once one instance is constructed.
 */
export function evaluateSubject(code: string): unknown {
	const program = ts.transpileModule(
		`${code}\nconst instance = new Subject();\nJSON.stringify({ log, fields: Object.entries(instance).toSorted(), statics: Object.entries(Subject).toSorted() });\n`,
		{ compilerOptions: { target: ts.ScriptTarget.ES2022, useDefineForClassFields: true } }
	).outputText;
	return runInNewContext(program);
}
