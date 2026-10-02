import type { ConfiguredPlugin } from "@gabroberge/oxlint-plugin";
import { defineConfiguredPlugin } from "@gabroberge/oxlint-plugin";

import { requireArraySpeciesRule } from "./rules/require-array-species/require-array-species";
import { sortExportsRule } from "./rules/sort-exports/sort-exports";

const plugin: ConfiguredPlugin = defineConfiguredPlugin("typescript", [requireArraySpeciesRule, sortExportsRule]);

export default plugin;
