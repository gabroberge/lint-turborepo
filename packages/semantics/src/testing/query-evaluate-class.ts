import { runInNewContext } from "node:vm";
import ts from "typescript";

export interface QueryField {
	initializer: string;
	name: string;
}

export interface QueryObservation {
	/** The message of an error thrown while defining or constructing the class, or `null`. */
	error: string | null;
	/** The field whose initializer was running when the error was thrown, or `null`. */
	errorField: string | null;
	/** Own instance properties by key; a function shows as `"function"`, `NaN` as `null`. */
	instance: Record<string, unknown>;
	/** Labels pushed by `record(label)`, in call order. */
	log: string[];
}

/**
 * Helpers the evaluated code can call without declaring them, so the analysis
 * sees them as unknown globals: `record(label)` logs and returns `label`,
 * `next()` returns an incrementing counter, `run(callback)` calls `callback`
 * right away.
 */
const PRELUDE = [
	"const log = [];",
	"let counter = 0;",
	"let field = null;",
	"function next() { counter += 1; return counter; }",
	"function record(label) { log.push(label); return label; }",
	"function run(callback) { return callback(); }",
	"function own(target) {",
	"\tconst result = {};",
	"\tfor (const key of Object.getOwnPropertyNames(target).toSorted()) {",
	"\t\tconst value = target[key];",
	'\t\tresult[key] = typeof value === "function" ? "function" : value;',
	"\t}",
	"\treturn result;",
	"}"
].join("\n");

/** The source of class `A` with the given fields, then the members in `rest`. */
export function queryClassSource(fields: readonly QueryField[], rest: readonly string[]): string {
	return ["class A {", ...fields.map((field) => `\t${field.name} = ${field.initializer};`), ...rest, "}"].join("\n");
}

/**
 * Transpiles class `A` (ES2022, `useDefineForClassFields`) with every field
 * initializer instrumented to note its field, runs it in a fresh `node:vm`
 * context, constructs it once and observes its own fields and the log.
 */
export function queryEvaluateClass(fields: readonly QueryField[], rest: readonly string[]): QueryObservation {
	const instrumented = fields.map((field) => ({
		initializer: `(field = ${JSON.stringify(field.name)}, ${field.initializer})`,
		name: field.name
	}));
	const { outputText } = ts.transpileModule(queryClassSource(instrumented, rest), {
		compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, useDefineForClassFields: true }
	});
	const script = [
		PRELUDE,
		"JSON.stringify((() => {",
		"\ttry {",
		outputText,
		"\t\tconst instance = new A();",
		"\t\treturn { error: null, errorField: null, instance: own(instance), log };",
		"\t} catch (error) {",
		"\t\treturn { error: String(error), errorField: field, instance: {}, log };",
		"\t}",
		"})());"
	];

	return JSON.parse(String(runInNewContext(script.join("\n")))) as QueryObservation;
}
