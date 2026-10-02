export interface Entry {
	body: string;
	method: "ALL" | "GET" | "HEAD" | "POST";
	name: string;
	path?: string;
}
