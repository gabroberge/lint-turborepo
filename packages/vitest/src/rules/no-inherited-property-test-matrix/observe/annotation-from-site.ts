import type { InstantiationSite } from "./instantiation-sites";

export function annotationFromSite(site: InstantiationSite): string | null {
	if (site.kind !== "annotated") {
		return null;
	}

	return site.annotation;
}
