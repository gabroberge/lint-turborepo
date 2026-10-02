import { BaseDto } from "./base.dto";

export class DerivedDto extends BaseDto {
	public readonly ownField?: number;
}
