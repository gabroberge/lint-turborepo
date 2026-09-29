import { describe, expect, it } from "vitest";

import { defineConfiguredPlugin } from "./define-configured-plugin";
import type { PluginRule } from "./plugin-rule";

const recommendedErrorRule: PluginRule = {
	create() {
		return {};
	},
	defaultSeverity: "error",
	meta: {
		docs: {
			description: "A recommended rule enabled as an error.",
			recommended: true
		}
	},
	name: "recommended-error"
};

const recommendedWarnRule: PluginRule = {
	create() {
		return {};
	},
	defaultSeverity: "warn",
	meta: {
		docs: {
			description: "A recommended rule enabled as a warning.",
			recommended: true
		}
	},
	name: "recommended-warn"
};

const optionalRule: PluginRule = {
	create() {
		return {};
	},
	defaultSeverity: "warn",
	meta: {
		docs: {
			description: "A rule included only in the all preset."
		}
	},
	name: "optional-rule"
};

describe(defineConfiguredPlugin, () => {
	const plugin = defineConfiguredPlugin("example", [recommendedErrorRule, recommendedWarnRule, optionalRule]);

	it("should register every rule", () => {
		expect.assertions(1);

		expect(Object.keys(plugin.rules).toSorted()).toStrictEqual([
			"optional-rule",
			"recommended-error",
			"recommended-warn"
		]);
	});

	it("should enable every rule in all at its default severity", () => {
		expect.assertions(1);

		expect(plugin.configs.all.rules).toStrictEqual({
			"example/optional-rule": "warn",
			"example/recommended-error": "error",
			"example/recommended-warn": "warn"
		});
	});

	it("should enable only recommended rules in recommended", () => {
		expect.assertions(1);

		expect(Object.keys(plugin.configs.recommended.rules).toSorted()).toStrictEqual([
			"example/recommended-error",
			"example/recommended-warn"
		]);
	});

	it("should keep each recommended rule's default severity", () => {
		expect.assertions(1);

		expect(plugin.configs.recommended.rules).toStrictEqual({
			"example/recommended-error": "error",
			"example/recommended-warn": "warn"
		});
	});

	it("should register the plugin under its name in all", () => {
		expect.assertions(1);

		expect(plugin.configs.all.plugins).toStrictEqual({
			example: plugin
		});
	});

	it("should register the plugin under its name in recommended", () => {
		expect.assertions(1);

		expect(plugin.configs.recommended.plugins).toStrictEqual({
			example: plugin
		});
	});
});
