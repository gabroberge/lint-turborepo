import { Controller, Delete, Get, Patch, Post, Put } from "@nestjs/common";

interface UserLookup {
	catchAll(): string;
	create(): string;
	findActive(): string;
	findAll(): string;
	findDetails(id: string): string;
	findOne(id: string): string;
	remove(id: string): string;
	replace(id: string): string;
	update(id: string): string;
}

@Controller("users")
export class UsersController {
	constructor(private readonly users: UserLookup) {}

	@Get("*path")
	public catchAll(): string {
		return this.users.catchAll();
	}

	@Post()
	public create(): string {
		return this.users.create();
	}

	@Get("active")
	public findActive(): string {
		return this.users.findActive();
	}

	@Get(":id")
	public findOne(id: string): string {
		return this.users.findOne(this.cacheKey(id));
	}

	@Get()
	public findAll(): string {
		return this.users.findAll();
	}

	@Get(":id/details")
	public findDetails(id: string): string {
		return this.users.findDetails(id);
	}

	@Put(":id")
	public replace(id: string): string {
		return this.users.replace(id);
	}

	@Delete(":id")
	public remove(id: string): string {
		return this.users.remove(id);
	}

	@Patch(":id")
	public update(id: string): string {
		return this.users.update(id);
	}

	private cacheKey(id: string): string {
		return `user:${id}`;
	}
}
