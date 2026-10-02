export function normalizePath(filename: string): string {
	return filename.replaceAll("\\", "/");
}
