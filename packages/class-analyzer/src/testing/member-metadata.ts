import type { AnalyzedMember } from "../index";
import { analyzeMembers } from "../index";
import { lines } from "./lines";
import { parseWithScope } from "./parse-with-scope";

export type MemberMetadata = Omit<AnalyzedMember, "index" | "node">;

/** The metadata of the single member of an abstract class with body `member`. */
export function memberMetadata(member: string): MemberMetadata {
	const { body } = parseWithScope(lines("abstract class A {", `\t${member}`, "}"));
	const [analyzed] = analyzeMembers(body);
	if (analyzed === undefined) {
		throw new Error("Expected a member");
	}

	const { index: _index, node: _node, ...metadata } = analyzed;
	return metadata;
}
