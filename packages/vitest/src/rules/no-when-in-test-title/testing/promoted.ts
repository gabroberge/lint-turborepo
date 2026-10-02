export function promoted(describeHead: string, params: string, testCall: string): string {
	return `${describeHead}, ${params} => {\n\t${testCall};\n});`;
}
