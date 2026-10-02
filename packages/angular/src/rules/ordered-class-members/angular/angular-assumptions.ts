import type { CallAssumption, ClassAssumptions } from "@gabroberge/typescript-class-analyzer";
import type { SourceCode } from "@oxlint/plugins";

import { angularApiOf } from "./angular-api-of";
import { ORDER_INSENSITIVE_APIS, SIGNAL_APIS } from "./angular-apis";

/**
 * What the initialization analysis may assume about `@angular/core` calls:
 * signal, input, model and query factories return signals whose calls run
 * only the functions given to them; `inject()`, `output()` and the other
 * order-insensitive factories run nothing observable. Every other call,
 * including `effect()` and `toSignal()`, stays unknown code.
 */
export function angularAssumptions(sourceCode: SourceCode): ClassAssumptions {
	return {
		assumeCall(call): CallAssumption | null {
			const api = angularApiOf(sourceCode, call.callee);
			if (api === null || !ORDER_INSENSITIVE_APIS.has(api)) {
				return null;
			}

			return SIGNAL_APIS.has(api) ? "signal-factory" : "factory";
		}
	};
}
