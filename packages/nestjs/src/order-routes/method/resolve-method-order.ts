import { DEFAULT_METHOD_ORDER } from "./default-method-order";
import { normalizeMethodOrder } from "./normalize-method-order";
import { withOmittedKnownMethods } from "./with-omitted-known-methods";

export function resolveMethodOrder(configured: readonly string[] | undefined): string[] {
	return withOmittedKnownMethods(normalizeMethodOrder(configured ?? DEFAULT_METHOD_ORDER));
}
