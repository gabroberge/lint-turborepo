export async function call(baseUrl: string, path: string, method = "GET"): Promise<string> {
	const response = await fetch(`${baseUrl}${path}`, { method });
	return response.text();
}
