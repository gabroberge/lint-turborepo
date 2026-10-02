import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

import { packageRoot } from "./package-root";

export function ensurePluginBuild(): void {
	const dist = join(packageRoot, "dist/index.mjs");
	if (existsSync(dist)) {
		return;
	}

	const build = spawnSync("bun", ["run", "build"], { cwd: packageRoot, encoding: "utf8" });
	if (build.status !== 0) {
		throw new Error(build.stderr || build.stdout);
	}
}
