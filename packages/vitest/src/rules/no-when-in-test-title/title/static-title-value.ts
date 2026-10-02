import type { StaticTitle } from "./static-title";

export function staticTitleValue(title: StaticTitle | null): string | null {
	if (title === null) {
		return null;
	}

	return title.value;
}
