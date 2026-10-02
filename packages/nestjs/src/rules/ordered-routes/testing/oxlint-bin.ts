import { existsSync } from "node:fs";
import { join } from "node:path";

import { packageRoot } from "./package-root";

export function oxlintBin(): string {
	const candidates = [
		join(packageRoot, "node_modules/.bin/oxlint"),
		join(packageRoot, "../../node_modules/.bin/oxlint")
	];

	const found = candidates.find((candidate) => existsSync(candidate));
	if (found === undefined) {
		throw new Error("oxlint is not installed");
	}

	return found;
}
