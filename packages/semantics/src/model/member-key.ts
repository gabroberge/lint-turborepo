/**
 * The runtime key of a class member. A `#private` name and a string key with
 * the same spelling are different keys.
 */
export interface MemberKey {
	name: string;
	private: boolean;
}
