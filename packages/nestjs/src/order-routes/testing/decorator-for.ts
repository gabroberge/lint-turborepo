import { All, Get, Head, Post } from "@nestjs/common";

import type { Entry } from "./entry";

export function decoratorFor(method: Entry["method"]): (path?: string) => MethodDecorator {
	switch (method) {
		case "ALL": {
			return All;
		}
		case "GET": {
			return Get;
		}
		case "HEAD": {
			return Head;
		}
		case "POST": {
			return Post;
		}
	}
}
