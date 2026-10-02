import type { Context } from "@oxlint/plugins";
import path from "node:path";

export function absoluteFilename(context: Context): string {
	if (path.isAbsolute(context.filename)) {
		return context.filename;
	}

	return path.resolve(context.cwd, context.filename);
}
