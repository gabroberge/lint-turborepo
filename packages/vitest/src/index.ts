import type { ConfiguredPlugin } from "@gabroberge/oxlint-plugin";
import { defineConfiguredPlugin } from "@gabroberge/oxlint-plugin";

import { noArrangeInTestRule } from "./rules/no-arrange-in-test/no-arrange-in-test";
import { noGenericHttpExceptionAssertionRule } from "./rules/no-generic-http-exception-assertion/no-generic-http-exception-assertion";
import { noIdenticalTestBodyRule } from "./rules/no-identical-test-body/no-identical-test-body";
import { noIfInTestTitleRule } from "./rules/no-if-in-test-title/no-if-in-test-title";
import { noInheritedPropertyTestMatrixRule } from "./rules/no-inherited-property-test-matrix/no-inherited-property-test-matrix";
import { noRedundantWiringTestRule } from "./rules/no-redundant-wiring-test/no-redundant-wiring-test";
import { noSingleCaseEachRule } from "./rules/no-single-case-each/no-single-case-each";
import { noSpyOnOutsideBeforeEachRule } from "./rules/no-spy-on-outside-before-each/no-spy-on-outside-before-each";
import { noTautologicalEqualityRule } from "./rules/no-tautological-equality/no-tautological-equality";
import { noTestOutsideDescribeRule } from "./rules/no-test-outside-describe/no-test-outside-describe";
import { noWhenInSuiteTitleRule } from "./rules/no-when-in-suite-title/no-when-in-suite-title";
import { noWhenInTestTitleRule } from "./rules/no-when-in-test-title/no-when-in-test-title";
import { orderedDtoTestGroupsRule } from "./rules/ordered-dto-test-groups/ordered-dto-test-groups";
import { requireExpectRule } from "./rules/require-expect/require-expect";

const plugin: ConfiguredPlugin = defineConfiguredPlugin("vitestExtended", [
	noArrangeInTestRule,
	noGenericHttpExceptionAssertionRule,
	noIdenticalTestBodyRule,
	noIfInTestTitleRule,
	noInheritedPropertyTestMatrixRule,
	noRedundantWiringTestRule,
	noSingleCaseEachRule,
	noSpyOnOutsideBeforeEachRule,
	noTautologicalEqualityRule,
	noTestOutsideDescribeRule,
	noWhenInSuiteTitleRule,
	noWhenInTestTitleRule,
	orderedDtoTestGroupsRule,
	requireExpectRule
]);

export default plugin;
