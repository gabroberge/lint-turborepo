export interface PathSegment {
	kind: SegmentKind;
	value: string;
}

export type SegmentKind = "literal" | "param" | "wildcard";

export function parseSegment(rawSegment: string): PathSegment {
	if (rawSegment.startsWith("*")) {
		return { kind: "wildcard", value: rawSegment.slice(1) };
	}

	if (rawSegment.startsWith("{*") && rawSegment.endsWith("}")) {
		return { kind: "wildcard", value: rawSegment.slice(2, -1) };
	}

	if (rawSegment.startsWith(":")) {
		return { kind: "param", value: rawSegment.slice(1) };
	}

	return { kind: "literal", value: rawSegment };
}
