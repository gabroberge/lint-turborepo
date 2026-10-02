import type { Context, VisitorWithHooks } from "@oxlint/plugins";

import { resolveMethodOrder } from "../../order-routes";
import { reorderController } from "./reorder/reorder-controller";
import { methodOrderOption } from "./report/method-order-option";
import { reportUnorderedRoutes } from "./report/report-unordered-routes";
import { createControllerWalk } from "./walk/create-controller-walk";

export function lint(context: Context): VisitorWithHooks {
	return createControllerWalk(context, (controller) => {
		const rewrite = reorderController(controller.entries, resolveMethodOrder(methodOrderOption(context)));
		reportUnorderedRoutes(context, controller, rewrite);
	});
}
