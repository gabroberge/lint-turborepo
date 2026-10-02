import { runInNewContext } from "node:vm";
import ts from "typescript";

export interface Observation {
	/** The message of an error thrown while defining or constructing the class, or `null`. */
	error: string | null;
	/** Own instance properties by key; a function shows as `"function"`. */
	instance: Record<string, unknown>;
	/** Labels pushed by `record(label)`, in call order. */
	log: string[];
	/** Own static properties by key; a function shows as `"function"`. */
	statics: Record<string, unknown>;
}

/**
 * Helpers the evaluated code can call without declaring them, so the analysis
 * sees them as unknown outside code: `record(label)` logs and returns
 * `label`, `next()` returns an incrementing counter, `run(callback)` calls
 * `callback` right away.
 */
const PRELUDE = [
	"const log = [];",
	"let counter = 0;",
	"function next() { counter += 1; return counter; }",
	"function record(label) { log.push(label); return label; }",
	"function run(callback) { return callback(); }",
	"function own(target, skip) {",
	"\tconst result = {};",
	"\tfor (const key of Object.getOwnPropertyNames(target).filter((name) => !skip.includes(name)).sort()) {",
	"\t\tconst value = target[key];",
	'\t\tresult[key] = typeof value === "function" ? "function" : value;',
	"\t}",
	"\treturn result;",
	"}"
].join("\n");

/**
 * Transpiles `code` (ES2022, `useDefineForClassFields`), defines it in a
 * fresh `node:vm` context, constructs `className` once and observes the
 * field values, static values and side-effect log.
 */
export function evaluateClass(code: string, className: string): Observation {
	const { outputText } = ts.transpileModule(code, {
		compilerOptions: {
			module: ts.ModuleKind.ESNext,
			target: ts.ScriptTarget.ES2022,
			useDefineForClassFields: true
		}
	});
	const script = [
		PRELUDE,
		"JSON.stringify((() => {",
		"\ttry {",
		outputText,
		`\t\tconst instance = new ${className}();`,
		`\t\treturn { error: null, instance: own(instance, []), log, statics: own(${className}, ["length", "name", "prototype"]) };`,
		"\t} catch (error) {",
		"\t\treturn { error: String(error), instance: {}, log, statics: {} };",
		"\t}",
		"})());"
	];

	return JSON.parse(String(runInNewContext(script.join("\n")))) as Observation;
}
