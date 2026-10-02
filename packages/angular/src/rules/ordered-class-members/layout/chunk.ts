/** The movable source slice of one class member: its owned comments, decorators and the member itself. */
export interface Chunk {
	/** Number of blank (whitespace-only) lines between the previous chunk and this one in the source; 0 for the first chunk. */
	blankLinesBefore: number;
	/** End offset (exclusive): member end, extended over comments that start on the same line as the member's last line. */
	end: number;
	/** Whitespace between the start of the line and `start`. */
	indent: string;
	/** Start offset: the first leading comment owned by the member, else the member's own start. */
	start: number;
}
