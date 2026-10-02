/**
 * A tiny deterministic pseudo-random generator (xorshift32) for graph
 * property checks, returning floats in [0, 1). The seed is scrambled first
 * so that small, consecutive seeds give unrelated sequences (plain xorshift
 * starts with tiny values from a tiny seed, and stays at 0 from 0).
 */
export function graphRandom(seed: number): () => number {
	let state = Math.imul((seed >>> 0) ^ 0x9e_37_79_b9, 0x85_eb_ca_6b);
	state = Math.imul(state ^ (state >>> 13), 0xc2_b2_ae_35);
	state = (state ^ (state >>> 16)) >>> 0 || 0x9e_37_79_b9;
	return () => {
		state ^= state << 13;
		state >>>= 0;
		state ^= state >>> 17;
		state ^= state << 5;
		state >>>= 0;
		return state / 4_294_967_296;
	};
}
