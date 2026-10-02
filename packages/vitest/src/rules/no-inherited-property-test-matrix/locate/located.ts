import type { ClassLikeDeclaration, SourceFile } from "typescript";

export interface Located {
	displayName: string;
	node: ClassLikeDeclaration;
	source: SourceFile;
}
