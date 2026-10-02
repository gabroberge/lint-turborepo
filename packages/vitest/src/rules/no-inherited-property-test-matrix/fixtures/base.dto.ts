import { RootDto } from "./root.dto";

export class BaseDto extends RootDto {
	public readonly inheritedField?: number;
}
