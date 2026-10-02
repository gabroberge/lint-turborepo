/**
 * What evaluating some code may do, as far as initialization order is
 * concerned. Member keys are those of the class being analyzed.
 */
export interface Effects {
	/**
	 * Members whose code may run: method and accessor bodies, and every field
	 * that is read or called, whose stored functions may be called by whoever
	 * receives its value.
	 */
	calls: Set<string>;
	/**
	 * Reads state outside the instance: a mutable binding, a property of
	 * another object, a spread or `for...of` iteration, or a call to a field
	 * holding a `signal-factory` result.
	 */
	external: boolean;
	/** May touch any member: `this` escapes, `super` is used, or a member cannot be resolved. */
	opaque: boolean;
	/** Members whose value is read. */
	reads: Set<string>;
	/** May change state outside the instance, typically by calling unknown code. */
	sideEffects: boolean;
	/** Members assigned. */
	writes: Set<string>;
}
