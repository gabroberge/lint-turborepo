import type { Context } from "@oxlint/plugins";

interface Options {
	methodOrder?: string[];
}

export function methodOrderOption(context: Context): string[] | undefined {
	const options = context.options[0] as Options | undefined;
	return options?.methodOrder;
}
