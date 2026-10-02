export function basename(filename: string): string {
	return filename.slice(filename.lastIndexOf("/") + 1);
}
