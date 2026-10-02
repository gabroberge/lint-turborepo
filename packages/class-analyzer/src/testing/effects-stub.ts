export interface EffectsStub {
	calls?: string[];
	external?: boolean;
	opaque?: boolean;
	reads?: string[];
	sideEffects?: boolean;
	writes?: string[];
}

/** The shape of the package's internal effect records, built from plain lists. */
export interface StubbedEffects {
	calls: Set<string>;
	external: boolean;
	opaque: boolean;
	reads: Set<string>;
	sideEffects: boolean;
	writes: Set<string>;
}

/** Effects built from plain key lists. */
export function effectsStub(stub: EffectsStub = {}): StubbedEffects {
	return {
		calls: new Set(stub.calls),
		external: stub.external ?? false,
		opaque: stub.opaque ?? false,
		reads: new Set(stub.reads),
		sideEffects: stub.sideEffects ?? false,
		writes: new Set(stub.writes)
	};
}
