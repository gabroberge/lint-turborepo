/** Angular lifecycle hook method names. Their relative order is left to `@angular-eslint/sort-lifecycle-methods`. */
export const LIFECYCLE_HOOKS: ReadonlySet<string> = new Set([
	"ngAfterContentChecked",
	"ngAfterContentInit",
	"ngAfterViewChecked",
	"ngAfterViewInit",
	"ngDoCheck",
	"ngOnChanges",
	"ngOnDestroy",
	"ngOnInit"
]);
