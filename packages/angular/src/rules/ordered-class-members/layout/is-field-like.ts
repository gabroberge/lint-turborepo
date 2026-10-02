import type { ESTree } from "@oxlint/plugins";

/** Whether a member has no body to close it, so it may end without a terminating `;`. */
export function isFieldLike(member: ESTree.ClassElement): boolean {
	switch (member.type) {
		case "AccessorProperty":
		case "PropertyDefinition":
		case "TSAbstractAccessorProperty":
		case "TSAbstractPropertyDefinition":
		case "TSIndexSignature": {
			return true;
		}
		case "MethodDefinition":
		case "TSAbstractMethodDefinition": {
			return member.value.body === null;
		}
		case "StaticBlock": {
			return false;
		}
	}
}
