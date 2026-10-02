export function diagnosticFor(filename: string): "useSpecificException" | "useValidationError" {
	if (filename.endsWith(".dto.spec.ts")) {
		return "useValidationError";
	}

	return "useSpecificException";
}
