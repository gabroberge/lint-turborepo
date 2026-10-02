import type { Type } from "@nestjs/common";
import { Controller, Header } from "@nestjs/common";

import { decoratorFor } from "./decorator-for";
import type { Entry } from "./entry";

export function buildController(entries: Entry[]): Type {
	class ProbeController {
		public probe(): string {
			return "probe";
		}
	}

	for (const entry of entries) {
		const respond = function handle(): string {
			return entry.body;
		};

		Object.defineProperty(ProbeController.prototype, entry.name, {
			configurable: true,
			value: respond,
			writable: true
		});

		const descriptor = Object.getOwnPropertyDescriptor(ProbeController.prototype, entry.name);
		if (descriptor === undefined) {
			throw new Error(`Missing descriptor for ${entry.name}`);
		}

		const decorate = decoratorFor(entry.method);
		decorate(entry.path)(ProbeController.prototype, entry.name, descriptor);
		Header("x-handler", entry.body)(ProbeController.prototype, entry.name, descriptor);
	}

	Controller("users")(ProbeController);
	return ProbeController;
}
