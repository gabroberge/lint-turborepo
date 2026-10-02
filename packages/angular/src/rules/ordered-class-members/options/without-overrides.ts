import type { GroupObject, Options } from "./options";

/** A default group without the settings the user chose at the top level, so those settings apply to it. */
export function withoutOverrides(group: GroupObject, raw: Options): GroupObject {
	const { newlinesWithin, visibility, ...rest } = group;
	return {
		...rest,
		...(newlinesWithin === undefined || raw.newlinesWithin !== undefined ? {} : { newlinesWithin }),
		...(visibility === undefined || raw.visibility !== undefined ? {} : { visibility })
	};
}
