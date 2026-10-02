import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { ensurePluginBuild } from "./ensure-plugin-build";
import { oxlintBin } from "./oxlint-bin";
import { packageRoot } from "./package-root";

interface LintCase {
	code: string;
	name: string;
	options?: [{ methodOrder?: string[] }];
}

export function lintWithOxlint(testCase: LintCase): { status: number | null; output: string } {
	ensurePluginBuild();
	const directory = mkdtempSync(join(packageRoot, ".tmp-"));
	const file = join(directory, "controller.ts");
	const config = join(directory, "oxlint.config.json");
	const ruleConfig = testCase.options === undefined ? "error" : ["error", ...testCase.options];

	writeFileSync(file, testCase.code);
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
			rules: {
				"nestjs/ordered-routes": ruleConfig
			}
		})
	);

	try {
		const result = spawnSync(oxlintBin(), ["-c", config, file, "--fix"], {
			cwd: packageRoot,
			encoding: "utf8"
		});
		return { output: readFileSync(file, "utf8"), status: result.status };
	} finally {
		rmSync(directory, { force: true, recursive: true });
	}
}
