import type { ConfiguredPlugin } from "@gabroberge/oxlint-plugin";
import { defineConfiguredPlugin } from "@gabroberge/oxlint-plugin";

import { orderedRoutesRule } from "./rules/ordered-routes/ordered-routes";

const plugin: ConfiguredPlugin = defineConfiguredPlugin("nestjs", [orderedRoutesRule]);

export default plugin;
