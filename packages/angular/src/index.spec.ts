import { describe, expect, it } from "vitest";

import plugin from "./index";

describe("angular plugin", () => {
	it("registers ordered-class-members", () => {
		expect.assertions(1);

		expect(Object.keys(plugin.rules)).toContain("ordered-class-members");
	});

	it("enables ordered-class-members as an error in the all config", () => {
		expect.assertions(1);

		expect(plugin.configs.all.rules["angular/ordered-class-members"]).toBe("error");
	});

	it("leaves ordered-class-members out of the recommended config", () => {
		expect.assertions(1);

		expect(plugin.configs.recommended.rules).not.toHaveProperty("angular/ordered-class-members");
	});

	it("offers an autofix for ordered-class-members", () => {
		expect.assertions(1);

		expect(plugin.rules["ordered-class-members"]?.meta?.fixable).toBe("code");
	});

	it("validates the ordered-class-members options with a schema", () => {
		expect.assertions(1);

		expect(plugin.rules["ordered-class-members"]?.meta?.schema).toHaveLength(1);
	});
});
