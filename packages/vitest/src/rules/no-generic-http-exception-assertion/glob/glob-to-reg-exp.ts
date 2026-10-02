export function globToRegExp(pattern: string): RegExp {
	let source = "^";
	let index = 0;

	while (index < pattern.length) {
		const char = pattern[index];
		if (char === undefined) {
			break;
		}

		if (char === "*" && pattern[index + 1] === "*") {
			if (pattern[index + 2] === "/") {
				source += "(?:.*/)?";
				index += 3;
				continue;
			}

			source += ".*";
			index += 2;
			continue;
		}

		if (char === "*") {
			source += "[^/]*";
			index++;
			continue;
		}

		if (char === "?") {
			source += "[^/]";
			index++;
			continue;
		}

		if ("\\.[]{}()+-^$|".includes(char)) {
			source += `\\${char}`;
		} else {
			source += char;
		}

		index++;
	}

	source += "$";
	return new RegExp(source);
}
