import type { ConfiguredPlugin } from "@gabroberge/oxlint-plugin";
import { defineConfiguredPlugin } from "@gabroberge/oxlint-plugin";

import { orderedClassMembersRule } from "./rules/ordered-class-members/ordered-class-members";
import { preferImmutableResourceRule } from "./rules/prefer-immutable-resource/prefer-immutable-resource";
import { preferProtectedOutputsRule } from "./rules/prefer-protected-outputs/prefer-protected-outputs";

const plugin: ConfiguredPlugin = defineConfiguredPlugin("angular", [
	orderedClassMembersRule,
	preferImmutableResourceRule,
	preferProtectedOutputsRule
]);

export default plugin;
