import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { ensurePluginBuild } from "./ensure-plugin-build";
import { oxlintBin } from "./oxlint-bin";
import { packageRoot } from "./package-root";
import type { RuleOptions } from "./rule-options";

export interface OxlintResult {
	output: string;
	status: number | null;
}

/** Run oxlint with the built plugin and `--fix` on one file; returns the fixed text and the exit status. */
export function lintWithOxlint(code: string, options: RuleOptions = []): OxlintResult {
	ensurePluginBuild();
	const directory = mkdtempSync(join(packageRoot, ".tmp-"));
	const file = join(directory, "component.ts");
	const config = join(directory, "oxlint.config.json");

	writeFileSync(file, code);
	writeFileSync(
		config,
		JSON.stringify({
			categories: {
				correctness: "off",
				nursery: "off",
				pedantic: "off",
				perf: "off",
				restriction: "off",
				style: "off",
				suspicious: "off"
			},
			jsPlugins: [join(packageRoot, "dist/index.mjs")],
			rules: { "angular/ordered-class-members": ["error", ...options] }
		})
	);

	try {
		const result = spawnSync(oxlintBin(), ["-c", config, file, "--fix"], { cwd: packageRoot, encoding: "utf8" });
		return { output: readFileSync(file, "utf8"), status: result.status };
	} finally {
		rmSync(directory, { force: true, recursive: true });
	}
}
