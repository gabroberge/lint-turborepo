export async function handler(baseUrl: string, path: string, method: string): Promise<string | null> {
	const response = await fetch(`${baseUrl}${path}`, { method });
	return response.headers.get("x-handler");
}
