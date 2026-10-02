/**
 * When a member runs code while the class is set up: instance field
 * initializers run on construction, static ones and static blocks while the
 * class is defined. Methods, accessors, constructors and type-only members
 * run nothing then.
 */
export type Timeline = "instance" | "static";
