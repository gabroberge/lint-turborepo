export function wrapped(describeTitle: string, testCall: string): string {
	return `describe(${JSON.stringify(describeTitle)}, () => {\n\t${testCall};\n});`;
}
