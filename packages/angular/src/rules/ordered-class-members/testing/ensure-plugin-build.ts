import { spawnSync } from "node:child_process";

import { packageRoot } from "./package-root";

let built = false;

/** Build the plugin once per test run, so oxlint loads the code under test rather than a stale `dist`. */
export function ensurePluginBuild(): void {
	if (built) {
		return;
	}

	const build = spawnSync("bun", ["run", "build"], { cwd: packageRoot, encoding: "utf8" });
	if (build.status !== 0) {
		throw new Error(build.stderr || build.stdout);
	}

	built = true;
}
