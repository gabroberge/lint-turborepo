export const KNOWN_HTTP_METHODS = [
	"POST",
	"GET",
	"PATCH",
	"PUT",
	"DELETE",
	"OPTIONS",
	"HEAD",
	"SEARCH",
	"QUERY",
	"ALL"
] as const;

export type HttpMethod = (typeof KNOWN_HTTP_METHODS)[number];
