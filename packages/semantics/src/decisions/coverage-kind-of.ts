import type { CoverageKind, DecisionKind } from "./decision-kind";

const coverageKinds: Record<DecisionKind, CoverageKind | null> = {
	catch: null,
	conditional: "cond-expr",
	"default-value": "default-arg",
	if: "if",
	"logical-and": "binary-expr",
	"logical-assignment": null,
	"logical-or": "binary-expr",
	loop: null,
	nullish: "binary-expr",
	"optional-chain": null,
	switch: "switch"
};

/**
 * The Istanbul branch type a decision kind corresponds to, or `null` when
 * Istanbul and v8 coverage (through `ast-v8-to-istanbul`) do not count it as
 * a branch.
 *
 * | Decision kind                          | Coverage branch | Coverage locations                                       |
 * | -------------------------------------- | --------------- | -------------------------------------------------------- |
 * | `if`                                   | `if`            | consequent and alternate (also when `else` is implicit)  |
 * | `conditional`                          | `cond-expr`     | consequent and alternate                                 |
 * | `logical-and`, `logical-or`, `nullish` | `binary-expr`   | every leaf operand of a flattened logical expression     |
 * | `switch`                               | `switch`        | one per case; no location for an implicit `no-match`     |
 * | `default-value`                        | `default-arg`   | the default expression                                   |
 * | `loop`, `catch`, `optional-chain`      | none            |                                                          |
 * | `logical-assignment`                   | none            |                                                          |
 *
 * The correspondence is not one to one. Coverage tools flatten a nested
 * logical expression such as `a && b || c` into a single `binary-expr`
 * branch with one location per leaf operand (`a`, `b`, `c`), while this model
 * reports one decision per operator whose only region is the right operand.
 * Coverage counts every location, including the left operand that always
 * runs. A consumer matching the two must do so by location and accept that
 * tools and their versions differ.
 */
export function coverageKindOf(kind: DecisionKind): CoverageKind | null {
	return coverageKinds[kind];
}
