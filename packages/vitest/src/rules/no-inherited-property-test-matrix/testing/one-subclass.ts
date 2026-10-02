export function oneSubclass(): string {
	return [
		"class BaseDto {",
		"    inheritedField?: number;",
		"    rootField?: number;",
		"}",
		"",
		"class DerivedDto extends BaseDto {",
		"    ownField?: number;",
		"}",
		""
	].join("\n");
}
