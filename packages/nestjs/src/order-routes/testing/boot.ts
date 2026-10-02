import type { INestApplication } from "@nestjs/common";
import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { buildController } from "./build-controller";
import type { Entry } from "./entry";

export async function boot(entries: Entry[]): Promise<{ app: INestApplication; baseUrl: string }> {
	const controller = buildController(entries);

	class ProbeModule {
		public probe(): string {
			return "probe";
		}
	}

	Module({ controllers: [controller] })(ProbeModule);

	const app = await NestFactory.create(ProbeModule, { logger: false });
	await app.listen(0, "127.0.0.1");
	return { app, baseUrl: await app.getUrl() };
}
