export function lines(...rows: string[]): string {
	return `${rows.join("\n")}\n`;
}
