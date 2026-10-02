/**
 * A DTO spec is a file whose path ends with `.dto.spec.ts`. Backslashes are
 * treated as slashes so a Windows path matches the same way.
 */
export function isDtoSpecFilename(filename: string): boolean {
	return filename.replaceAll("\\", "/").endsWith(".dto.spec.ts");
}
