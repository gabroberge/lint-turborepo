/**
 * How a member key of the analyzed timeline behaves when code touches it.
 * A `function-field` holds a value whose calls run only analyzed code: a
 * function literal, or the result of a `signal-factory` call.
 */
export type MemberKind = "accessor" | "field" | "function-field" | "method" | "parameter";
