# Flow

> A flow of addons.

This module is the successor of [ihack2712/middleware](https://github.com/ihack2712/middleware).

```ts
// Imports
import Flow from "https://deno.land/x/flow/mod.ts";

// deno-lint-ignore no-explicit-any
const flow = new Flow<(num: number) => any>();

flow.use(
	async (num, next) => {
		console.log("The magic number is:", num);
		await next();
	},
	// deno-lint-ignore no-explicit-any
	new Flow<(num: number) => any>(
		async (num, next) => {
			console.log("Hi from sub middleware.");
			await next();
		}
	),
	async (_, next) => {
		await next();
		console.log("Done");
	},
	num => console.log(num),
	num => console.log("You won't see this.")
);

// Run the flow.
await flow.run(1);
```

You can also pass a next function to `<Flow>.run(...args, next?)` and Flow will call that next function instead of creating an empty one.
