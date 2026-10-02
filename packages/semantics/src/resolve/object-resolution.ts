import type { DeclarationId } from "../model/ids";

/**
 * What the object of a member access denotes: a module class's instance or
 * the class itself (so the member can be resolved), `this` with a receiver
 * the model cannot determine, or any other object.
 */
export type ObjectResolution =
	| { class: DeclarationId; kind: "class-member"; static: boolean }
	| { kind: "foreign" }
	| { kind: "unknown-receiver" };
