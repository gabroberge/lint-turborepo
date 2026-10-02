import { existsSync } from "node:fs";
import path from "node:path";

export function resolveModule(fromFile: string, specifier: string): string | null {
	if (!specifier.startsWith(".")) {
		return null;
	}

	const base = path.resolve(path.dirname(fromFile), specifier);
	const candidates: string[] = [];

	if (specifier.endsWith(".js")) {
		const withoutExtension = base.slice(0, -3);
		candidates.push(`${withoutExtension}.ts`, `${withoutExtension}.tsx`, `${withoutExtension}.mts`);
	} else if (specifier.endsWith(".ts") || specifier.endsWith(".tsx") || specifier.endsWith(".mts")) {
		candidates.push(base);
	} else {
		candidates.push(`${base}.ts`, `${base}.tsx`, `${base}.mts`, path.join(base, "index.ts"));
	}

	for (const candidate of candidates) {
		if (candidate.includes(`${path.sep}node_modules${path.sep}`)) {
			continue;
		}

		if (existsSync(candidate)) {
			return candidate;
		}
	}

	return null;
}
