import { hasAsiHazard } from "../layout/has-asi-hazard";
import { parseClass } from "./parse-class";

/** Whether placing the members of the first class of `code` in `order` has an ASI hazard. */
export function asiHazardOf(code: string, order: readonly number[]): boolean {
	const { body } = parseClass(code);

	return hasAsiHazard(code, body.body, order);
}
